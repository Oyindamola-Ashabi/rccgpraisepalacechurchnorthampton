import img4 from "@/assets/gallery/image4.jpg";
import img7 from "@/assets/gallery/image7.jpg";
import img10 from "@/assets/gallery/image10.jpg";
import img14 from "@/assets/gallery/image14.jpg";
import img17 from "@/assets/gallery/image17.jpg";
import img38 from "@/assets/uploads/image38.jpg";
import img39 from "@/assets/uploads/image39.jpg";
import img40 from "@/assets/uploads/image40.jpg";
import img41 from "@/assets/uploads/image41.jpg";
import pic1 from "@/assets/uploads/PIC1.jpg";
import pic2 from "@/assets/uploads/PIC2.jpg";
import ycImg from "@/assets/uploads/YC.jpg";
import menImg from "@/assets/uploads/MEN.jpg";
import womenImg from "@/assets/uploads/WOMEN.jpg";
import bsImg from "@/assets/uploads/BS.png";

export type GalleryPhoto = {
  url: string;
  title: string;
  caption: string;
  category: "Fellowship" | "Celebration" | "Worship" | "Community" | "Couples" | "Youth";
};

export const galleryPhotos: GalleryPhoto[] = [
  { url: img4, title: "Family Sunday", caption: "A full-house family celebration at RCCG Praise Palace Northampton.", category: "Celebration" },
  { url: img7, title: "Fathers' Honour", caption: "Honouring our fathers of faith on a special Sunday.", category: "Celebration" },
  { url: img10, title: "Family Life Class", caption: "Discipleship and family life teaching in session.", category: "Fellowship" },
  { url: img14, title: "An Evening of Elegance", caption: "Warm fellowship at our annual dinner.", category: "Couples" },
  { url: img17, title: "Guests & Friends", caption: "Guests and friends gathered at our special dinner.", category: "Community" },
  { url: img38, title: "Night of Celebration", caption: "An unforgettable evening bathed in praise and colour.", category: "Celebration" },
  { url: img39, title: "Table Fellowship", caption: "Sharing life around the table after service.", category: "Fellowship" },
  { url: img40, title: "Family Meals", caption: "Breaking bread together as one household of faith.", category: "Community" },
  { url: img41, title: "Modern Encounter", caption: "Fresh moves of the Spirit in our modern gatherings.", category: "Worship" },
  { url: pic1, title: "An Elegant Evening", caption: "A beautifully set table at our couples evening.", category: "Couples" },
  { url: pic2, title: "The Students' Circle", caption: "Learning in community — students of the word.", category: "Fellowship" },
  { url: ycImg, title: "Raising Champions Youth Camp", caption: "The next generation on fire for God.", category: "Youth" },
  { url: menImg, title: "Men of Purpose", caption: "The men of Praise Palace standing strong.", category: "Fellowship" },
  { url: womenImg, title: "Daughters of Grace", caption: "A sisterhood of grace and prayer.", category: "Fellowship" },
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
  business: { url: bsImg, title: "Business School", caption: "", category: "Community" as const },
};
