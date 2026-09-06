import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import { mockPrisma, resetPrismaMock } from "../mocks/prisma.mock";

vi.mock("../../src/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("../../src/services/imageStorage.service", () => ({
  uploadImage: vi.fn(),
  deleteImage: vi.fn(),
}));

import { createApp } from "../../src/app";
import { signAdminToken } from "../../src/utils/jwt";
import * as imageStorage from "../../src/services/imageStorage.service";

const ADMIN_ID = "admin-1";
const IMAGE_ID = "55555555-5555-5555-5555-555555555555";

function authCookie() {
  const token = signAdminToken({ sub: ADMIN_ID, email: "admin@test.com", role: "SUPER_ADMIN" });
  return `admin_token=${token}`;
}

describe("Public gallery", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
  });

  it("lists current gallery images with no auth required", async () => {
    mockPrisma.galleryImage.findMany.mockResolvedValue([
      { id: IMAGE_ID, imageUrl: "https://cdn/img.jpg", publicId: "p1", title: "Clinic", caption: null },
    ]);

    const res = await request(app).get("/api/gallery");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].imageUrl).toBe("https://cdn/img.jpg");
  });
});

describe("Admin gallery management", () => {
  const app = createApp();

  beforeEach(() => {
    resetPrismaMock();
    vi.mocked(imageStorage.uploadImage).mockReset();
    vi.mocked(imageStorage.deleteImage).mockReset();
    mockPrisma.adminUser.findUnique.mockResolvedValue({
      id: ADMIN_ID,
      email: "admin@test.com",
      role: "SUPER_ADMIN",
      isActive: true,
    });
  });

  it("rejects unauthenticated access to the admin gallery list", async () => {
    const res = await request(app).get("/api/admin/gallery");
    expect(res.status).toBe(401);
  });

  it("lists gallery images with pagination metadata when authenticated", async () => {
    mockPrisma.galleryImage.findMany.mockResolvedValue([]);
    mockPrisma.galleryImage.count.mockResolvedValue(0);

    const res = await request(app).get("/api/admin/gallery?page=1&limit=20").set("Cookie", authCookie());

    expect(res.status).toBe(200);
    expect(res.body.data.pagination).toEqual({ page: 1, limit: 20, total: 0, totalPages: 1 });
  });

  it("rejects an upload with no file attached", async () => {
    const res = await request(app).post("/api/admin/gallery").set("Cookie", authCookie()).field("title", "Test");
    expect(res.status).toBe(400);
  });

  it("returns a clean error when Cloudinary is not configured", async () => {
    vi.mocked(imageStorage.uploadImage).mockResolvedValue(undefined);

    const res = await request(app)
      .post("/api/admin/gallery")
      .set("Cookie", authCookie())
      .field("title", "Test")
      .attach("image", Buffer.from("fake-image-bytes"), { filename: "photo.jpg", contentType: "image/jpeg" });

    expect(res.status).toBe(500);
    expect(mockPrisma.galleryImage.create).not.toHaveBeenCalled();
  });

  it("uploads an image and saves it", async () => {
    vi.mocked(imageStorage.uploadImage).mockResolvedValue({ url: "https://cdn/new.jpg", publicId: "cloud-id-1" });
    mockPrisma.galleryImage.create.mockResolvedValue({
      id: IMAGE_ID,
      imageUrl: "https://cdn/new.jpg",
      publicId: "cloud-id-1",
      title: "Test",
      caption: null,
    });

    const res = await request(app)
      .post("/api/admin/gallery")
      .set("Cookie", authCookie())
      .field("title", "Test")
      .attach("image", Buffer.from("fake-image-bytes"), { filename: "photo.jpg", contentType: "image/jpeg" });

    expect(res.status).toBe(201);
    expect(res.body.data.imageUrl).toBe("https://cdn/new.jpg");
    expect(mockPrisma.galleryImage.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ imageUrl: "https://cdn/new.jpg", publicId: "cloud-id-1" }) })
    );
  });

  it("rejects a non-image file", async () => {
    const res = await request(app)
      .post("/api/admin/gallery")
      .set("Cookie", authCookie())
      .attach("image", Buffer.from("not an image"), { filename: "doc.pdf", contentType: "application/pdf" });

    expect(res.status).toBe(400);
  });

  it("deletes an image, removing it from both Cloudinary and the database", async () => {
    mockPrisma.galleryImage.findUnique.mockResolvedValue({ id: IMAGE_ID, publicId: "cloud-id-1" });
    mockPrisma.galleryImage.delete.mockResolvedValue({ id: IMAGE_ID });

    const res = await request(app).delete(`/api/admin/gallery/${IMAGE_ID}`).set("Cookie", authCookie());

    expect(res.status).toBe(200);
    expect(mockPrisma.galleryImage.delete).toHaveBeenCalledWith({ where: { id: IMAGE_ID } });
    expect(imageStorage.deleteImage).toHaveBeenCalledWith("cloud-id-1");
  });

  it("returns 404 when deleting a gallery image that does not exist", async () => {
    mockPrisma.galleryImage.findUnique.mockResolvedValue(null);

    const res = await request(app).delete(`/api/admin/gallery/${IMAGE_ID}`).set("Cookie", authCookie());

    expect(res.status).toBe(404);
  });
});
