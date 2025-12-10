import axios from "axios";
// import { prisma } from "../config/prisma.js";
import { GetListByKeyword } from "youtube-search-api";

// ---------------------
// SEARCH CONTROLLER
// ---------------------

export const search = async (req, res, next) => {
  const query = req.query.q;

  if (!query) {
    return next(new Error("query is required"));
  }

  try {
    const response = await axios.get(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(
        query
      )}`
    );

    const rawData = response.data;

    if (
      Array.isArray(rawData) &&
      typeof rawData[0] === "string" &&
      Array.isArray(rawData[1]) &&
      Array.isArray(rawData[2]) &&
      typeof rawData[3] === "object" &&
      rawData[3] !== null
    ) {
      const data = {
        query: rawData[0],
        suggestions: rawData[1],
        extraData: rawData[2],
        metadata: rawData[3],
      };

      return res.json({ suggestions: data.suggestions });
    }
  } catch (error) {
    console.log("error:", error);
    next(error);
  }
};

// ---------------------
// SONG CONTROLLER
// ---------------------

export const song = async (req, res, next) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const result = await GetListByKeyword(query, false, 3);

    if (!result || !result.items || result.items.length === 0) {
      return res.status(404).json({
        data: query,
        message: "No songs found for the given query",
      });
    }

    const songs = result.items
      .map((video) => ({
        url: `https://www.youtube.com/watch?v=${video.id}`,
        title: video.title?.split(" ")[0],
        thumbnail: video.thumbnail?.thumbnails?.[0]?.url,
        length: video.length.simpleText
          .split(":")
          .map(Number)
          .reduce((t, v) => t * 60 + v, 0),
      }))
      .filter((song) => song.length < 300); // keep < 5 minutes

    if (songs.length < 1) {
      return res
        .status(404)
        .json({ message: "No short songs found (less than 5 minutes)" });
    }

    return res.status(200).json({
      data: songs,
      message: "Songs found for the given query",
    });
  } catch (error) {
    console.error("Error fetching song:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
