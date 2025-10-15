const bobaShops = [
    {
        name: "Boba Guys",
        address: "123 Main St, San Francisco, CA",
        lat: 37.7749,
        lng: -122.4194
    },
    {
        name: "Sharetea",
        address: "456 Market St, San Francisco, CA",
        lat: 37.795,
        lng: -122.403
    },
    {
        name: "TPumps",
        address: "789 Broadway, San Francisco, CA",
        lat: 37.79,
        lng: -122.42
    }
];

const shopList = document.getElementById('shop-list');

function renderShops(shops) {
    shopList.innerHTML = '';
    shops.forEach(shop => {
        const shopElement = document.createElement('div');
        shopElement.classList.add('shop-item');
        shopElement.innerHTML = `
            <h3>${shop.name}</h3>
            <p>${shop.address}</p>
        `;
        shopList.appendChild(shopElement);
    });
}

let map;
const markers = [];

function initMap() {
    map = L.map('map').setView([37.7749, -122.4194], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}

function addMarkers(shops) {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers.length = 0;

    shops.forEach(shop => {
        const marker = L.marker([shop.lat, shop.lng]).addTo(map)
            .bindPopup(`<b>${shop.name}</b><br>${shop.address}`);
        markers.push(marker);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderShops(bobaShops);
    initMap();
    addMarkers(bobaShops);

    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredShops = bobaShops.filter(shop =>
            shop.name.toLowerCase().includes(searchTerm)
        );
        renderShops(filteredShops);
        addMarkers(filteredShops);
    });
});