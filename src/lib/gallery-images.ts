import img4 from "@/assets/gallery/image4.jpg.asset.json";
import img7 from "@/assets/gallery/image7.jpg.asset.json";
import img8 from "@/assets/gallery/image8.jpg.asset.json";
import img10 from "@/assets/gallery/image10.jpg.asset.json";
import img11 from "@/assets/gallery/image11.jpg.asset.json";
import img13 from "@/assets/gallery/image13.jpg.asset.json";
import img14 from "@/assets/gallery/image14.jpg.asset.json";
import img16 from "@/assets/gallery/image16.jpg.asset.json";
import img17 from "@/assets/gallery/image17.jpg.asset.json";

export type GalleryPhoto = {
  url: string;
  title: string;
  caption: string;
  category: "Fellowship" | "Celebration" | "Worship" | "Community" | "Couples" | "Youth";
};

export const galleryPhotos: GalleryPhoto[] = [
  { url: img4.url, title: "Family Sunday", caption: "A full-house family celebration at RCCG Praise Palace Northampton.", category: "Celebration" },
  { url: img7.url, title: "Fathers' Honour", caption: "Honouring our fathers of faith on a special Sunday.", category: "Celebration" },
  { url: img8.url, title: "Mothers of the House", caption: "Beautiful moments with the mothers of the church.", category: "Fellowship" },
  { url: img10.url, title: "Family Life Class", caption: "Discipleship and family life teaching in session.", category: "Fellowship" },
  { url: img11.url, title: "Midweek Study", caption: "Growing together in the word during midweek study.", category: "Fellowship" },
  { url: img13.url, title: "Couples Retreat Moment", caption: "A tender moment from our Couples Retreat evening.", category: "Couples" },
  { url: img14.url, title: "An Evening of Elegance", caption: "Warm fellowship at our annual dinner.", category: "Couples" },
  { url: img16.url, title: "Ministering the Word", caption: "The word going forth at a special evening service.", category: "Worship" },
  { url: img17.url, title: "Guests & Friends", caption: "Guests and friends gathered at our special dinner.", category: "Community" },
];

// Convenience slices used across the site.
export const heroSlides = [
  galleryPhotos[0], // family
  galleryPhotos[7], // ministering word
];

export const eventPhotos = {
  couples: galleryPhotos[5],
  dinner: galleryPhotos[6],
  fathers: galleryPhotos[1],
  family: galleryPhotos[0],
  study: galleryPhotos[4],
  familyLife: galleryPhotos[3],
  mothers: galleryPhotos[2],
  wordEvening: galleryPhotos[7],
  guests: galleryPhotos[8],
};
