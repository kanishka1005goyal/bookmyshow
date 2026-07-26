import { Request, Response } from "express";
import Screen from "../models/screen";
import Theatre from "../models/theatre";

// Public: list screens for a given theatre (used by Theatre API per the module table)
export const getScreensByTheatre = async (req: Request, res: Response) => {
  try {
    const { theatreId } = req.params;
    const screens = await Screen.find({ theatreId, isActive: true }).sort({ name: 1 });
    res.status(200).json({ screens });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Public: single screen by id
export const getScreenById = async (req: Request, res: Response) => {
  try {
    const screen = await Screen.findById(req.params.id);
    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }
    res.status(200).json({ screen });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only
export const createScreen = async (req: Request, res: Response) => {
  try {
    const theatre = await Theatre.findById(req.body.theatreId);
    if (!theatre) {
      return res.status(400).json({ message: "Invalid theatreId" });
    }
    const screen = await Screen.create(req.body);
    res.status(201).json({ screen });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only
export const updateScreen = async (req: Request, res: Response) => {
  try {
    const screen = await Screen.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }
    res.status(200).json({ screen });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// Admin only — soft delete
export const deleteScreen = async (req: Request, res: Response) => {
  try {
    const screen = await Screen.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!screen) {
      return res.status(404).json({ message: "Screen not found" });
    }
    res.status(200).json({ message: "Screen deactivated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
