// Cloudflare Workers API untuk CRUD
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
    const url = new URL(request.url)
    const path = url.pathname

    // CORS headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders })
    }

    // API Routes
    if (path === '/api/items' && request.method === 'GET') {
        return getItems(request)
    } else if (path === '/api/items' && request.method === 'POST') {
        return createItem(request)
    } else if (path.startsWith('/api/items/') && request.method === 'PUT') {
        return updateItem(request, path.split('/').pop())
    } else if (path.startsWith('/api/items/') && request.method === 'DELETE') {
        return deleteItem(request, path.split('/').pop())
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders })
}

async function getItems(request) {
    const items = await getItemsFromKV()
    return new Response(JSON.stringify(items), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
}

async function createItem(request) {
    const item = await request.json()
    item.id = Date.now()
    
    const items = await getItemsFromKV()
    items.push(item)
    await setItemsToKV(items)
    
    return new Response(JSON.stringify(item), {
        status: 201,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
}

async function updateItem(request, id) {
    const updatedItem = await request.json()
    const items = await getItemsFromKV()
    const index = items.findIndex(item => item.id === parseInt(id))
    
    if (index === -1) {
        return new Response('Not Found', { status: 404, headers: corsHeaders })
    }
    
    items[index] = { ...items[index], ...updatedItem }
    await setItemsToKV(items)
    
    return new Response(JSON.stringify(items[index]), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
}

async function deleteItem(request, id) {
    const items = await getItemsFromKV()
    const filteredItems = items.filter(item => item.id !== parseInt(id))
    
    if (items.length === filteredItems.length) {
        return new Response('Not Found', { status: 404, headers: corsHeaders })
    }
    
    await setItemsToKV(filteredItems)
    
    return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
    })
}

// Helper functions for Cloudflare KV
async function getItemsFromKV() {
    // In production, get from KV storage
    // const value = await INVENTORY.get('items')
    // return value ? JSON.parse(value) : []
    return [] // Placeholder
}

async function setItemsToKV(items) {
    // In production, set to KV storage
    // await INVENTORY.put('items', JSON.stringify(items))
}