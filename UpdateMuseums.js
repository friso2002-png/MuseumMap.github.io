const axios = require("axios");
const fs = require("fs");

// Overpass query
const query = `
[out:json][timeout:60];

area["ISO3166-1"="NL"][admin_level=2]->.searchArea;

(
  node["tourism"="museum"](area.searchArea);
  way["tourism"="museum"](area.searchArea);
  relation["tourism"="museum"](area.searchArea);
);

out center;
`;

// Kleuren
const museumColors = {
    art: "red",
    history: "brown",
    war: "black",
    science: "green",
    railway: "navy",
    maritime: "teal",
    aviation: "skyblue",
    nature: "darkgreen",
    children: "hotpink",
    archaeological: "chocolate",
    open_air: "orange",
    other: "BlueViolet"
};

// Zoekwoorden
const categories = {

    art: [
        "art",
        "gallery",
        "kunst",
        "painting",
        "modern art"
    ],

    history: [
        "history",
        "historisch",
        "heritage",
        "historic"
    ],

    war: [
        "war",
        "military",
        "oorlog",
        "army",
        "battle"
    ],

    science: [
        "science",
        "technology",
        "techniek",
        "physics",
        "chemistry"
    ],

    railway: [
        "rail",
        "railway",
        "train",
        "spoor"
    ],

    maritime: [
        "maritime",
        "ship",
        "scheepvaart"
    ],

    aviation: [
        "aviation",
        "luchtvaart",
        "aircraft"
    ],

    nature: [
        "nature",
        "natural history",
        "natuur"
    ],

    children: [
        "children",
        "kids",
        "toy"
    ],

    archaeological: [
        "archaeology",
        "archeology"
    ],

    open_air: [
        "open air",
        "openlucht"
    ]
};

async function updateMuseums() {

    console.log("Downloading museums...");

    const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        query,
        {
            headers: {
                "Content-Type": "text/plain"
            }
        }
    );

    const museums = [];

    response.data.elements.forEach(el => {

        const lat = el.lat || el.center?.lat;
        const lon = el.lon || el.center?.lon;

        if (!lat || !lon) return;

        const tags = el.tags || {};

        const name = tags.name || "Museum";

        const text = [
            tags.name,
            tags.museum,
            tags.subject,
            tags.theme,
            tags.collection,
            tags.description
        ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

        let museumType = "other";

        for (const [type, keywords] of Object.entries(categories)) {

            if (keywords.some(word => text.includes(word))) {
                museumType = type;
                break;
            }
        }

        museums.push({

            name,

            lat,

            lon,

            type: museumType,

            color: museumColors[museumType] || museumColors.other

        });

    });

    fs.writeFileSync(
        "museums.json",
        JSON.stringify(museums, null, 2)
    );

    console.log(`${museums.length} museums saved.`);
}

updateMuseums();
