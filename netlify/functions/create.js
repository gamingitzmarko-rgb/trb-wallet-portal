import { getStore } from "@netlify/blobs";

export const handler = async (event) => {
    // Only allow POST requests from your Admin Panel
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { total } = JSON.parse(event.body);

        if (!total || total <= 0) {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid total" }) };
        }

        // 1. Generate a secure 5-digit access code
        const code = Math.floor(10000 + Math.random() * 90000).toString();

        // 2. Mock asset prices (should match your dashboard prices for consistency)
        const prices = {
            bitcoin: 52410,
            ethereum: 3120,
            dogecoin: 0.14
        };

        // 3. Distribute the total USD across assets (e.g., 45% BTC, 35% ETH, 20% DOGE)
        const walletData = {
            code: code,
            wallet: {
                btc: parseFloat(((total * 0.45) / prices.bitcoin).toFixed(6)),
                eth: parseFloat(((total * 0.35) / prices.ethereum).toFixed(4)),
                doge: parseFloat(((total * 0.20) / prices.dogecoin).toFixed(2)),
                prices: prices // Store prices used at time of creation
            },
            target_total_usd: total,
            createdAt: new Date().toISOString()
        };

        // 4. Save to Netlify Blobs (Database)
        const store = getStore("wallet_codes");
        await store.set(code, JSON.stringify(walletData));

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                code: code, 
                target_total_usd: total 
            })
        };

    } catch (error) {
        console.error("Error creating code:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" })
        };
    }
};
