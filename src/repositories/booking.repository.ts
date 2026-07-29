import mongoose from "mongoose";
import {
  BookingModel,
  BookingDocument,
  IBooking,
  BookingStatus,
} from "../models/Booking.model";

const GUIDE_POPULATE = {
  path: "guide",
  select: "bio pricePerDay rating profileImage",
  populate: {
    path: "user",
    select: "firstName lastName email profileImage",
  },
};

export class BookingRepository {

  async create(
    data: Partial<IBooking>
  ): Promise<BookingDocument> {
    const booking = await BookingModel.create(data);
    return booking.populate(GUIDE_POPULATE);
  }

  async findById(
    id: string
  ): Promise<BookingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findById(id)
      .populate("user", "firstName lastName email phone")
      .populate(
        "package",
        "title slug duration price coverImage destination"
      )
      .populate(GUIDE_POPULATE);
  }

  async findByBookingNumber(
    bookingNumber: string
  ): Promise<BookingDocument | null> {
    return BookingModel.findOne({ bookingNumber })
      .populate("user", "firstName lastName email")
      .populate("package", "title slug duration price")
      .populate(GUIDE_POPULATE);
  }

  async findByUser(
    userId: string
  ): Promise<BookingDocument[]> {
    return BookingModel.find({ user: userId })
      .populate("package", "title slug duration price coverImage")
      .populate(GUIDE_POPULATE)
      .sort({ createdAt: -1 });
  }

  async findAll(
    filter: Partial<{ status: BookingStatus }> = {},
    page = 1,
    limit = 10
  ): Promise<{
    bookings: BookingDocument[];
    total: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await BookingModel.countDocuments(filter);
    const bookings = await BookingModel.find(filter)
      .populate("user", "firstName lastName email")
      .populate("package", "title slug duration price")
      .populate(GUIDE_POPULATE)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      bookings,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async update(
    id: string,
    data: Partial<IBooking>
  ): Promise<BookingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return BookingModel.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).populate(GUIDE_POPULATE);
  }

  // ── Assign / unassign a guide ─────────────────────────
  async assignGuide(
    id: string,
    guideId: string | null
  ): Promise<BookingDocument | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const update = guideId
      ? { $set: { guide: new mongoose.Types.ObjectId(guideId) } }
      : { $unset: { guide: "" } };
    return BookingModel.findByIdAndUpdate(id, update, {
      new: true,
    })
      .populate("user", "firstName lastName email")
      .populate("package", "title slug duration price")
      .populate(GUIDE_POPULATE);
  }

  async findByPackage(
    packageId: string
  ): Promise<BookingDocument[]> {
    return BookingModel.find({
      package: new mongoose.Types.ObjectId(packageId),
    }).populate("user", "firstName lastName email");
  }
}