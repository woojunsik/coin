const cron = require("node-cron");
const Wallet = require("../models/Wallet");
const axios = require("axios");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const updateAllRankings = require("./updateRankings");

module.exports = () => {
  // ⏱ 매 5분마다 실행
  const { assetBalanceCron } = require("../config/settings");
  cron.schedule(assetBalanceCron, async () => {
    console.log("🔁 [Cron] 자산 자동 갱신 시작");

    const wallets = await Wallet.find(); // 모든 거래소 API 키 정보 조회
    console.log(`[크론] 총 지갑 수: ${wallets.length}`);

    for (const wallet of wallets) {
      const { exchange, accessKey, secretKey, user } = wallet;
      try {
        //
        // ✅ 업비트
        //
        if (exchange === "upbit") {
          const nonce = uuidv4();
          const token = jwt.sign({ access_key: accessKey, nonce }, secretKey, {
            algorithm: "HS256",
          });

          const headers = { Authorization: `Bearer ${token}` };
          const accountRes = await axios.get(
            "https://api.upbit.com/v1/accounts",
            { headers }
          );

          const marketRes = await axios.get(
            "https://api.upbit.com/v1/market/all"
          );
          const krwMarkets = marketRes.data
            .filter((m) => m.market.startsWith("KRW-"))
            .map((m) => m.market);

          const tickers = await axios.get("https://api.upbit.com/v1/ticker", {
            params: { markets: krwMarkets.join(",") },
          });

          const priceMap = {};
          tickers.data.forEach((t) => {
            const symbol = t.market.split("-")[1];
            priceMap[symbol] = t.trade_price;
          });

          const assets = [];
          let totalKRW = 0;

          for (const acc of accountRes.data) {
            const balance = parseFloat(acc.balance);
            const currency = acc.currency;
            let krw = 0;

            if (currency === "KRW") krw = balance;
            else krw = balance * (priceMap[currency] || 0);

            totalKRW += krw;
            assets.push({ currency, balance, krw });
          }

          await Wallet.findOneAndUpdate(
            { user, exchange },
            { assets, totalKRW, updatedAt: new Date() }
          );
        }

        //
        // ✅ 빗썸
        //
        else if (exchange === "bithumb") {
          const endpoint = "/info/balance";
          const nonce = Date.now().toString();
          const qs = "currency=ALL";
          const str = `${endpoint}\0${qs}\0${nonce}`;
          const sign = crypto
            .createHmac("sha512", secretKey)
            .update(str)
            .digest("hex");

          const headers = {
            "Api-Key": accessKey,
            "Api-Sign": sign,
            "Api-Nonce": nonce,
            "Content-Type": "application/x-www-form-urlencoded",
          };

          const res = await axios.post(
            `https://api.bithumb.com${endpoint}`,
            qs,
            { headers }
          );
          const data = res.data.data;
          const prices = (
            await axios.get("https://api.bithumb.com/public/ticker/ALL_KRW")
          ).data.data;

          const assets = [];
          let totalKRW = 0;

          for (const key in data) {
            if (!key.endsWith("_balance")) continue;
            const coin = key.replace("_balance", "");
            const balance = parseFloat(data[key]);
            const price =
              coin === "KRW" ? 1 : parseFloat(prices[coin]?.closing_price || 0);
            const krw = balance * price;

            totalKRW += krw;
            assets.push({ currency: coin, balance, krw });
          }

          await Wallet.findOneAndUpdate(
            { user, exchange },
            { assets, totalKRW, updatedAt: new Date() }
          );
        }

        //
        // ✅ 바이낸스
        //
        else if (exchange === "binance") {
          const timestamp = Date.now();
          const query = `timestamp=${timestamp}`;
          const signature = crypto
            .createHmac("sha256", secretKey)
            .update(query)
            .digest("hex");

          const binanceRes = await axios.get(
            `https://api.binance.com/api/v3/account?${query}&signature=${signature}`,
            {
              headers: { "X-MBX-APIKEY": accessKey },
            }
          );

          const balances = binanceRes.data.balances.filter(
            (b) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
          );
          const tickers = await axios.get(
            "https://api.binance.com/api/v3/ticker/price"
          );
          const priceMap = {};
          tickers.data.forEach(
            (t) => (priceMap[t.symbol] = parseFloat(t.price))
          );

          const USDT_KRW = (
            await axios.get("https://api.upbit.com/v1/ticker?markets=KRW-USDT")
          ).data[0].trade_price;

          const assets = [];
          let totalKRW = 0;

          for (const b of balances) {
            const symbol = b.asset;
            const amount = parseFloat(b.free) + parseFloat(b.locked);
            const priceUSDT = priceMap[symbol + "USDT"] || 0;
            const krw = amount * priceUSDT * USDT_KRW;
            totalKRW += krw;
            assets.push({ currency: symbol, balance: amount, krw });
          }

          await Wallet.findOneAndUpdate(
            { user, exchange },
            { assets, totalKRW, updatedAt: new Date() }
          );
        }

        //
        // ✅ 바이비트
        //
        else if (exchange === "bybit") {
          const timestamp = Date.now().toString();
          const recvWindow = "5000";

          const queryObject = {
            api_key: accessKey.trim(),
            timestamp,
            recvWindow,
            accountType: "UNIFIED",
          };

          const queryString = Object.entries(queryObject)
            .sort()
            .map(([key, val]) => `${key}=${val}`)
            .join("&");

          const signature = crypto
            .createHmac("sha256", secretKey.trim())
            .update(queryString)
            .digest("hex");

          const url = `https://api.bybit.com/v5/account/wallet-balance?${queryString}&sign=${signature}`;
          const response = await axios.get(url);
          const result = response.data.result.list[0].coin;

          const usdtKrw = (
            await axios.get("https://api.upbit.com/v1/ticker?markets=KRW-USDT")
          ).data[0].trade_price;

          const assets = [];
          let totalKRW = 0;

          for (const c of result) {
            const balance = parseFloat(c.walletBalance);
            if (!balance) continue;
            const krw = balance * usdtKrw;
            totalKRW += krw;
            assets.push({ currency: c.coin, balance, krw });
          }

          await Wallet.findOneAndUpdate(
            { user, exchange },
            { assets, totalKRW, updatedAt: new Date() }
          );
        }

        //
        // ✅ 코인원
        //
        else if (exchange === "coinone") {
          const nonce = Date.now();
          const payload = {
            access_token: accessKey.trim(),
            nonce,
          };

          const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString(
            "base64"
          );
          const signature = crypto
            .createHmac("sha512", secretKey.trim())
            .update(payloadBase64)
            .digest("hex");

          const headers = {
            "Content-Type": "application/json",
            "X-COINONE-PAYLOAD": payloadBase64,
            "X-COINONE-SIGNATURE": signature,
          };

          const response = await axios.post(
            "https://api.coinone.co.kr/v2/account/balance/",
            {},
            { headers }
          );

          if (response.data?.result !== "success") {
            console.warn(
              `[⛔ Coinone 실패] user ${user}:`,
              response.data?.errorMsg
            );
            continue;
          }

          const assets = [];
          let totalKRW = 0;

          for (const [key, value] of Object.entries(response.data)) {
            if (!key.endsWith("_balance") || key === "krw_balance") continue;

            const symbol = key.replace("_balance", "");
            const amount = parseFloat(value);
            if (!amount || amount === 0) continue;

            let priceKRW = 0;
            try {
              const tickerRes = await axios.get(
                `https://api.upbit.com/v1/ticker?markets=KRW-${symbol.toUpperCase()}`
              );
              priceKRW = tickerRes.data[0]?.trade_price || 0;
            } catch {
              priceKRW = 0;
            }

            const krw = amount * priceKRW;
            totalKRW += krw;
            assets.push({
              currency: symbol.toUpperCase(),
              balance: amount,
              krw,
            });
          }

          if (response.data.krw) {
            const krwVal = parseFloat(response.data.krw);
            if (krwVal > 0) {
              totalKRW += krwVal;
              assets.push({ currency: "KRW", balance: krwVal, krw: krwVal });
            }
          }

          await Wallet.findOneAndUpdate(
            { user, exchange },
            { assets, totalKRW, updatedAt: new Date() }
          );

          console.log(
            `✅ [Coinone 갱신 완료] user ${user} → ₩${Math.round(
              totalKRW
            ).toLocaleString()}`
          );
        }
      } catch (err) {
        console.error(`[⛔ ${exchange}] ${user}:`, err.message || err);
      }
    }

    console.log("✅ [Cron] 자산 자동 갱신 완료");

    await updateAllRankings();
    console.log("📊 [Cron] 랭킹 캐시 갱신 완료");
  });
};
