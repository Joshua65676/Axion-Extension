function categorizeTweet(text) {
  const lower = text.toLowerCase();
  if (
    lower.includes("figma") ||
    lower.includes("design") ||
    lower.includes("ui/ux")
  )
    return "Design";
  if (
    lower.includes("ethereum") ||
    lower.includes("crypto") ||
    lower.includes("web3")
  )
    return "Web3";
  if (
    lower.includes("football") ||
    lower.includes("nba") ||
    lower.includes("messi")
  )
    return "Sports";
  if (
    lower.includes("javascript") ||
    lower.includes("python") ||
    lower.includes("coding")
  )
    return "Programming";
  if (
    lower.includes("movie") ||
    lower.includes("film") ||
    lower.includes("cinema") ||
    lower.includes("netflix")
  )
    return "Movies";
  if (
    lower.includes("music") ||
    lower.includes("song") ||
    lower.includes("album") ||
    lower.includes("spotify")
  )
    return "Music";
  if (
    lower.includes("art") ||
    lower.includes("painting") ||
    lower.includes("sculpture")
  )
    return "Art";
  if (
    lower.includes("science") ||
    lower.includes("biology") ||
    lower.includes("chemistry")
  )
    return "Science";
  if (
    lower.includes("technology") ||
    lower.includes("gadgets") ||
    lower.includes("ai")
  )
    return "Technology";
  if (
    lower.includes("betting") ||
    lower.includes("gambling") ||
    lower.includes("odds")
  )
    return "Betting";
  if (
    lower.includes("gaming") ||
    lower.includes("cod") ||
    lower.includes("streaming")
  )
    return "Gaming";
  return "Uncategorized";
}

function extractAndSendBookmarks() {
  const tweets = Array.from(document.querySelectorAll("article"))
    .map((el) => {
      const text = el.innerText;
      const anchor = el.querySelector('a[href*="/status/"]');
      const match = anchor?.href.match(/status\/(\d+)/);
      const id = match ? match[1] : null;

      const username = anchor?.href.split("/")[3] || "";
      const profilePic = el.querySelector("img")?.src || "";

      const media = Array.from(el.querySelectorAll('img[src*="twimg"]')).map(
        (img) => img.src
      );
      const video = el.querySelector("video")?.src || "";

      const stats = Array.from(
        el.querySelectorAll('[data-testid$="-count"]')
      ).map((el) => el.innerText);
      const [comments, retweets, likes] = stats;

      const views = el.querySelector('[aria-label*="Views"]')?.innerText || "";

      return id && text
        ? {
            id,
            text,
            username,
            profilePic,
            media,
            video,
            comments,
            retweets,
            likes,
            views,
            category: categorizeTweet(text),
          }
        : null;
    })
    .filter(Boolean);

  console.log(" Sending bookmarks:", tweets);

  fetch("http://localhost/axion/Axion-PHP/save_bookmarks.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: "twitteruser_id", bookmarks: tweets }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(" Response from backend:", data);
    })
    .catch((err) => {
      console.error(" Fetch error:", err);
    });
}

function autoScrollToBottom(callback) {
  let totalHeight = 0;
  const distance = 1000;
  const timer = setInterval(() => {
    window.scrollBy(0, distance);
    totalHeight += distance;

    if (totalHeight >= document.body.scrollHeight) {
      clearInterval(timer);
      setTimeout(callback, 3000); // Wait for tweets to load
    }
  }, 1000);
}

//  Auto-trigger when user is on bookmarks page
if (window.location.href.includes("/i/bookmarks")) {
  console.log(" Axion detected Twitter bookmarks page");
  window.scrollTo(0, document.body.scrollHeight);
  autoScrollToBottom(extractAndSendBookmarks);
}

//  Listen for manual trigger from popup button
chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "syncBookmarks") {
    console.log(" Manual sync triggered from popup");
    // window.scrollTo(0, document.body.scrollHeight);
    extractAndSendBookmarks();
  }
});
