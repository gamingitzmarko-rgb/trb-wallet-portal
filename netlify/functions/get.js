import { getStore } from "@netlify/blobs";

export default async (req, context) => {
    // Only allow GET requests
    if (req.method !== "GET") {
        return new Response("Method Not Allowed", { status: 405 });
    }

    try {
        // Extract the code from the URL (e.g., /api/get?code=12345)
        const url = new URL(req.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return new Response(JSON.stringify({ error: "Access code required" }), { status: 400 });
        }

        // Connect to the 'wallet_codes' database store
        const store = getStore("wallet_codes");
        
        // Fetch the data associated with that code
        const data = await store.get(code, { type: "json" });

        if (!data) {
            return new Response(JSON.stringify({ error: "Invalid or expired code" }), { status: 404 });
        }

        // Send the data back to your index.html dashboard
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { 
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*" 
            }
        });

    } catch (error) {
        console.error("Dashboard Login Error:", error);
        return new Response(JSON.stringify({ error: "Server connection failed" }), { status: 500 });
    }
};
