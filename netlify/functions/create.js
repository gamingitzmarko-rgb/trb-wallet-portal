import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // Only allow POST
    if (req.method !== "POST") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        const { total } = await req.json();

        if (!total || total <= 0) {
            return new Response(JSON.stringify({ error: "Invalid total" }), { status: 400 });
        }

        const code = Math.floor(10000 + Math.random() * 90000).toString();
        const prices = { bitcoin: 52410, ethereum: 3120, dogecoin: 0.14 };

        const walletData = {
            code: code,
            wallet: {
                btc: parseFloat(((total * 0.45) / prices.bitcoin).toFixed(6)),
                eth: parseFloat(((total * 0.35) / prices.ethereum).toFixed(4)),
                doge: parseFloat(((total * 0.20) / prices.dogecoin).toFixed(2)),
                prices: prices
            },
            target_total_usd: total,
            createdAt: new Date().toISOString()
        };

        // Initialize store
        const store = getStore("wallet_codes");
        await store.setJSON(code, walletData);

        return new Response(JSON.stringify({ 
            code: code, 
            target_total_usd: total 
        }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (error) {
        console.error("Admin Error:", error);
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
};
