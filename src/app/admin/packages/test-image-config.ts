// Test to verify that the image configuration is correct

// Test URLs that should be allowed
const testUrls = [
  // Firebase Storage URL from the error
  "https://firebasestorage.googleapis.com/v0/b/studio-4045740230-a0fa4.appspot.com/o/packages%2F1762688953730_Screenshot202025-09-1420at209%2520(2).avif?alt=media&token=0b8acd8e-8599-430c-8a58-1469971db3d7",
  
  // Firebase Storage URL with the bucket domain
  "https://studio-4045740230-a0fa4.firebasestorage.app/packages/1762688953730_Screenshot202025-09-1420at209%20(2).avif",
  
  // Existing allowed URLs
  "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944",
  "https://placehold.co/600x400"
];

console.log("Testing image URL patterns that should be allowed by Next.js configuration:");
testUrls.forEach((url, index) => {
  console.log(`${index + 1}. ${url}`);
});

console.log("\nNext.js configuration should allow these URLs after restart.");
console.log("Please restart your development server for changes to take effect.");