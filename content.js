const API_BASE_URL = "https://axion-api-1ylh.onrender.com";

function categorizeTweet(text) {
  const lower = (text || "").toLowerCase();
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

function showSyncStatus(message, isError = false) {
  let box = document.getElementById("axion-sync-status-box");

  if (!box) {
    box = document.createElement("div");
    box.id = "axion-sync-status-box";
    box.style.position = "fixed";
    box.style.right = "18px";
    box.style.bottom = "82px";
    box.style.zIndex = "2147483647";
    box.style.maxWidth = "260px";
    box.style.padding = "10px 12px";
    box.style.borderRadius = "10px";
    box.style.background = isError ? "#4c1d1d" : "#0d3b66";
    box.style.color = "#fff";
    box.style.fontSize = "12px";
    box.style.fontFamily = "Segoe UI, sans-serif";
    box.style.boxShadow = "0 12px 26px rgba(0,0,0,0.22)";
    box.style.border = "1px solid rgba(255,255,255,0.15)";
    document.body.appendChild(box);
  }

  box.textContent = message;
  box.style.background = isError ? "#4c1d1d" : "#0d3b66";
}

function showSyncPrompt() {
  if (document.getElementById("axion-bookmark-sync-button")) return;

  const container = document.createElement("div");
  container.id = "axion-bookmark-sync-button";
  container.style.position = "fixed";
  container.style.right = "18px";
  container.style.bottom = "18px";
  container.style.zIndex = "2147483647";
  container.style.fontFamily = "Segoe UI, sans-serif";

  container.innerHTML = `
    <button
      type="button"
      style="
        border: none;
        border-radius: 999px;
        background: linear-gradient(135deg, #1d9bf0, #0a8ae2);
        color: white;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 700;
        box-shadow: 0 10px 24px rgba(29, 155, 240, 0.35);
        cursor: pointer;
      "
    >
      Click to start sync
    </button>
  `;

  container.querySelector("button").addEventListener("click", () => {
    startBookmarkSync();
  });

  document.body.appendChild(container);
}

function getTweetMetricValue(article, selector) {
  const node = article.querySelector(selector);
  const text =
    node?.innerText?.trim() || node?.getAttribute("aria-label") || "0";
  return text === "" ? "0" : text;
}

function extractVisibleBookmarks() {
  return Array.from(document.querySelectorAll("article"))
    .map((article) => {
      const anchor = article.querySelector('a[href*="/status/"]');
      const href = anchor?.href || "";
      const match = href.match(/status\/(\d+)/);
      const tweetId = match ? match[1] : "";

      const usernameMatch = href.match(
        /https?:\/\/(?:x\.com|twitter\.com)\/([^/]+)/,
      );
      const username = usernameMatch ? usernameMatch[1] : "";

      const statusUrl = href ? href.replace("twitter.com", "x.com") : "";

      const tweetText =
        article.querySelector('[data-testid="tweetText"]')?.innerText?.trim() ||
        article.querySelector("div[lang]")?.innerText?.trim() ||
        "";
      const profilePic =
        article.querySelector(
          'img[src*="profile_images"], img[src*="twirpz.files.wordpress.com"], img[alt*="Profile"]',
        )?.src ||
        article.querySelector("img[alt]")?.src ||
        "";
      const media = Array.from(
        article.querySelectorAll(
          'img[src*="pbs.twimg.com"], img[src*="abs.twimg.com"]',
        ),
      )
        .map((img) => img.currentSrc || img.src)
        .filter(
          (src) =>
            src &&
            !/emoji|sticker|profile_images/i.test(src) &&
            !src.startsWith("blob:"),
        )
        .filter((src, index, arr) => arr.indexOf(src) === index);

      const videos = Array.from(article.querySelectorAll("video"))
        .flatMap((videoElement) => [
          videoElement.currentSrc,
          videoElement.src,
          ...Array.from(videoElement.querySelectorAll("source")).map(
            (source) => source.src,
          ),
        ])
        .filter(
          (src) =>
            src &&
            /^https?:/.test(src) &&
            !src.startsWith("blob:") &&
            !src.includes(".m3u8"),
        )
        .filter((src, index, arr) => arr.indexOf(src) === index);
      const videoPosters = Array.from(article.querySelectorAll("video[poster]"))
        .map((videoElement) => videoElement.poster)
        .filter((src) => src && !src.startsWith("blob:"));
      media.push(...videoPosters.filter((src) => !media.includes(src)));
      const comments = getTweetMetricValue(article, '[data-testid="reply"]');
      const retweets = getTweetMetricValue(article, '[data-testid="retweet"]');
      const likes = getTweetMetricValue(article, '[data-testid="like"]');
      const views =
        article
          .querySelector('[data-testid="viewCount"], [aria-label*="Views"]')
          ?.innerText?.trim() || "0";
      const isVerified = !!article.querySelector(
        'svg[aria-label="Verified account"]',
      );
      const stickers = Array.from(
        article.querySelectorAll('img[alt*="emoji"], img[alt*="sticker"]'),
      ).map((img) => img.src);

      if (!tweetId) return null;

      return {
        tweet_id: tweetId,
        tweet_text: tweetText,
        username,
        display_name:
          article
            .querySelector('[data-testid="User-Name"]')
            ?.innerText?.split("\n")[0]
            ?.trim() || username,
        tweet_url: statusUrl,
        profile_pic: profilePic,
        media,
        video: videos.length === 1 ? videos[0] : JSON.stringify(videos),
        comments,
        retweets,
        likes,
        views,
        stickers,
        is_verified: isVerified,
        category: categorizeTweet(tweetText),
      };
    })
    .filter(Boolean);
}

let bookmarkSyncInProgress = false;

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function collectBookmarksWhileScrolling() {
  const tweets = new Map();
  let idleBottomPasses = 0;
  let scrollPasses = 0;
  const maxScrollPasses = 600;

  window.scrollTo({ top: 0, behavior: "auto" });
  await wait(500);

  while (idleBottomPasses < 4 && scrollPasses < maxScrollPasses) {
    const previousCount = tweets.size;
    for (const tweet of extractVisibleBookmarks()) {
      tweets.set(tweet.tweet_id, tweet);
    }

    const foundNewTweets = tweets.size > previousCount;
    window.scrollBy({
      top: Math.max(400, Math.floor(window.innerHeight * 0.8)),
      behavior: "auto",
    });
    await wait(900);
    scrollPasses += 1;

    const atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 40;

    if (atBottom && !foundNewTweets) {
      idleBottomPasses += 1;
    } else {
      idleBottomPasses = 0;
    }

    showSyncStatus(`Scanning bookmarks... ${tweets.size} found`);
  }

  for (const tweet of extractVisibleBookmarks()) {
    tweets.set(tweet.tweet_id, tweet);
  }

  return Array.from(tweets.values());
}

async function sendBookmarkBatches(userId, tweets) {
  const batchSize = 50;
  let savedCount = 0;

  for (let offset = 0; offset < tweets.length; offset += batchSize) {
    const batch = tweets.slice(offset, offset + batchSize);
    showSyncStatus(
      `Saving ${Math.min(offset + batch.length, tweets.length)} of ${tweets.length}...`,
    );

    const response = await fetch(`${API_BASE_URL}/save_bookmarks.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, bookmarks: batch }),
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 180)}`);
    }

    const result = JSON.parse(text);
    if (result.status !== "success") {
      throw new Error(result.message || "Bookmark batch failed.");
    }
    savedCount += Number(result.saved_count) || 0;
  }

  return savedCount;
}

function startBookmarkSync() {
  if (bookmarkSyncInProgress) return;
  bookmarkSyncInProgress = true;
  showSyncStatus("Sync started. Scanning bookmarks...");

  chrome.storage.local.get("currentUser", (data) => {
    if (chrome.runtime.lastError) {
      console.error("Storage error:", chrome.runtime.lastError.message);
      showSyncStatus("Storage failed while syncing.", true);
      bookmarkSyncInProgress = false;
      return;
    }

    const user = data.currentUser;
    console.log("Axion debug: currentUser from storage", user);
    window.axionDebug = window.axionDebug || {};
    window.axionDebug.currentUser = user;

    if (!user || !user.user_id) {
      console.warn("No user info found in extension");
      showSyncStatus("Connect Axion first before syncing.", true);
      bookmarkSyncInProgress = false;
      return;
    }

    collectBookmarksWhileScrolling()
      .then(async (tweets) => {
        window.axionDebug = window.axionDebug || {};
        window.axionDebug.tweets = tweets;
        console.log("Axion extracted bookmarks:", tweets.length);

        if (!tweets.length) {
          showSyncStatus("No bookmarks were found on this page.", true);
          return;
        }

        const savedCount = await sendBookmarkBatches(user.user_id, tweets);
        showSyncStatus(`Saved ${savedCount} bookmarks.`);
      })
      .catch((err) => {
        console.error("Bookmark sync failed:", err);
        showSyncStatus(
          `Bookmark sync failed. ${err.message || "Unknown error"}`,
          true,
        );
      })
      .finally(() => {
        bookmarkSyncInProgress = false;
      });
  });
}

const isBookmarksPage = /\/i\/(bookmarks|history)(?:[/?#]|$)/.test(
  window.location.href,
);

if (isBookmarksPage) {
  console.log("Axion detected X bookmarks/history page");
  showSyncPrompt();
}

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "syncBookmarks") {
    console.log("Manual sync triggered from popup");
    startBookmarkSync();
  }
});

window.postMessage({ source: "axion-extension-installed" }, "*");
