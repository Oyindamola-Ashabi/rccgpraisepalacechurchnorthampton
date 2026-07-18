import img4 from "@/assets/gallery/image4.jpg.asset.json";
import img7 from "@/assets/gallery/image7.jpg.asset.json";
import img10 from "@/assets/gallery/image10.jpg.asset.json";
import img14 from "@/assets/gallery/image14.jpg.asset.json";
import img17 from "@/assets/gallery/image17.jpg.asset.json";
import img38 from "@/assets/uploads/image38.jpg.asset.json";
import img39 from "@/assets/uploads/image39.jpg.asset.json";
import img40 from "@/assets/uploads/image40.jpg.asset.json";
import img41 from "@/assets/uploads/image41.jpg.asset.json";
import pic1 from "@/assets/uploads/PIC1.jpg.asset.json";
import pic2 from "@/assets/uploads/PIC2.jpg.asset.json";
import ycImg from "@/assets/uploads/YC.jpg.asset.json";
import menImg from "@/assets/uploads/MEN.jpg.asset.json";
import womenImg from "@/assets/uploads/WOMEN.jpg.asset.json";
import bsImg from "@/assets/uploads/BS.png.asset.json";

export type GalleryPhoto = {
  url: string;
  title: string;
  caption: string;
  category: "Fellowship" | "Celebration" | "Worship" | "Community" | "Couples" | "Youth";
};

export const galleryPhotos: GalleryPhoto[] = [
  { url: img4.url, title: "Family Sunday", caption: "A full-house family celebration at RCCG Praise Palace Northampton.", category: "Celebration" },
  { url: img7.url, title: "Fathers' Honour", caption: "Honouring our fathers of faith on a special Sunday.", category: "Celebration" },
  { url: img10.url, title: "Family Life Class", caption: "Discipleship and family life teaching in session.", category: "Fellowship" },
  { url: img14.url, title: "An Evening of Elegance", caption: "Warm fellowship at our annual dinner.", category: "Couples" },
  { url: img17.url, title: "Guests & Friends", caption: "Guests and friends gathered at our special dinner.", category: "Community" },
  { url: img38.url, title: "Night of Celebration", caption: "An unforgettable evening bathed in praise and colour.", category: "Celebration" },
  { url: img39.url, title: "Table Fellowship", caption: "Sharing life around the table after service.", category: "Fellowship" },
  { url: img40.url, title: "Family Meals", caption: "Breaking bread together as one household of faith.", category: "Community" },
  { url: img41.url, title: "Modern Encounter", caption: "Fresh moves of the Spirit in our modern gatherings.", category: "Worship" },
  { url: pic1.url, title: "An Elegant Evening", caption: "A beautifully set table at our couples evening.", category: "Couples" },
  { url: pic2.url, title: "The Students' Circle", caption: "Learning in community — students of the word.", category: "Fellowship" },
  { url: ycImg.url, title: "Raising Champions Youth Camp", caption: "The next generation on fire for God.", category: "Youth" },
  { url: menImg.url, title: "Men of Purpose", caption: "The men of Praise Palace standing strong.", category: "Fellowship" },
  { url: womenImg.url, title: "Daughters of Grace", caption: "A sisterhood of grace and prayer.", category: "Fellowship" },
];

export const heroSlides = [
  galleryPhotos[0], // family
  galleryPhotos[8], // modern encounter (image41)
];

// Named references — try to keep each page using distinct images.
export const eventPhotos = {
  family: galleryPhotos[0],       // image4
  fathers: galleryPhotos[1],      // image7
  familyLife: galleryPhotos[2],   // image10
  dinner: galleryPhotos[3],       // image14
  guests: galleryPhotos[4],       // image17
  celebration: galleryPhotos[5],  // image38
  tableFellowship: galleryPhotos[6], // image39
  familyMeals: galleryPhotos[7],  // image40
  modernWorship: galleryPhotos[8], // image41
  couples: galleryPhotos[9],      // PIC1
  students: galleryPhotos[10],    // PIC2
  youth: galleryPhotos[11],       // YC
  men: galleryPhotos[12],         // MEN
  women: galleryPhotos[13],       // WOMEN
  business: { url: bsImg.url, title: "Business School", caption: "", category: "Community" as const },
};
