let allChampions = {};
let allItems = {};
let allSpells = {};
let latestVersion = "";

async function fetchData() {
    try {
        const versionResponse = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
        const versions = await versionResponse.json();
        latestVersion = versions[0];
        
        console.log(`Laden van LoL Data versie: ${latestVersion}`);

        // Fetch Champions
        const champResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/champion.json`);
        const champData = await champResponse.json();
        allChampions = champData.data;

        // Fetch Items
        const itemResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/item.json`);
        const itemData = await itemResponse.json();
        allItems = itemData.data;

        // Fetch Summoner Spells
        const spellResponse = await fetch(`https://ddragon.leagueoflegends.com/cdn/${latestVersion}/data/en_US/summoner.json`);
        const spellData = await spellResponse.json();
        allSpells = spellData.data;

        populateAllSelects();
    } catch (error) {
        console.error("Fout bij ophalen data:", error);
        alert("Kon data niet laden van Riot API. Controleer je verbinding.");
    }
}

function populateAllSelects() {
    const userChampSelect = document.getElementById('user-champion');
    const enemySelects = document.querySelectorAll('.enemy-select');
    const champNames = Object.keys(allChampions).sort();

    const createOption = (name) => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = allChampions[name].name;
        return option;
    };

    champNames.forEach(name => userChampSelect.appendChild(createOption(name)));
    enemySelects.forEach(select => {
        const emptyOption = document.createElement('option');
        emptyOption.value = "";
        emptyOption.textContent = "Kies vijand...";
        select.appendChild(emptyOption);
        champNames.forEach(name => select.appendChild(createOption(name)));
    });
}

function findItemIdByName(searchName) {
    if (!searchName) return null;

    const cleanSearch = searchName.toLowerCase().replace(/[^a-z0-9]/g, '');

    // 1. Probeer exacte match in de API
    for (const id in allItems) {
        const itemName = allItems[id].name.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (itemName === cleanSearch) {
            return id;
        }
    }

    // 2. Fallback lijst voor afwijkende namen
    const fallbacks = { 
        "worldatlas": "3869", 
        "platedsteelcaps": "3047", 
        "mercurystreads": "3111", 
        "sorcerersshoes": "3020", 
        "berserkersgreaves": "3006", 
        "jakshotheprotean": "6665", 
        "bladeoftheruinedking": "3153",
        "thecollector": "6676",
        "rapidfirecannon": "3094",
        "runaanshurricane": "3085",
        "stormsurge": "3154",
        "unendingdespair": "3156",
        "sunderedsky": "3302",
        "theblackcleaver": "3071",
        "steraksgage": "3053",
        "locketoftheironsolari": "3190",
        "deathsdance": "3139",
        "ludenscompanion": "3285"
    };

    return fallbacks[cleanSearch] || null;
}

function getBuildAdvies(userChamp, lane, mainThreat) {
    const tags = userChamp.tags; 
    const isBruiser = tags.includes("Fighter");
    const isTank = tags.includes("Tank") && !isBruiser;
    const isMage = tags.includes("Mage") || tags.includes("Support");
    const isAD = tags.includes("Marksman") || (tags.includes("Assassin") && !isBruiser);

    const championOverrides = {
        "Jhin": {
            core: ["The Collector", "Infinity Edge", "Rapid Firecannon"],
            runes: { 
                primary: "Precision (Fleet Footwork, Presence of Mind, Legend: Bloodline, Coup de Grace)", 
                secondary: "Sorcery (Celerity, Gathering Storm)" 
            }
        },
        "Twitch": {
            core: ["Blade of the Ruined King", "Runaan's Hurricane", "Infinity Edge"],
            runes: { 
                primary: "Precision (Press the Attack, Triumph, Legend: Alacrity, Coup de Grace)", 
                secondary: "Inspiration (Magical Footwear, Cosmic Insight)" 
            }
        },
        "Veigar": {
            core: ["Luden's Companion", "Rabadon's Deathcap", "Stormsurge"],
            runes: { 
                primary: "Inspiration (First Strike, Magical Footwear, Future's Market, Cosmic Insight)", 
                secondary: "Sorcery (Manaflow Band, Transcendence)" 
            }
        },
        "TahmKench": {
            core: ["Heartsteel", "Sunfire Aegis", "Unending Despair"],
            runes: { 
                primary: "Resolve (Grasp of the Undying, Demolish, Second Wind, Overgrowth)", 
                secondary: "Precision (Triumph, Legend: Alacrity)" 
            }
        },
        "Vi": {
            core: ["Sundered Sky", "The Black Cleaver", "Sterak's Gage"],
            runes: { 
                primary: "Precision (Conqueror, Triumph, Legend: Alacrity, Coup de Grace)", 
                secondary: "Inspiration (Magical Footwear, Cosmic Insight)" 
            }
        }
    };

    let build = [];
    let runes = { primary: "", secondary: "" };

    const override = championOverrides[userChamp.id];

    if (override) {
        build = [...override.core];
        runes = override.runes;
    } else if (isBruiser) {
        runes.primary = "Precision (Conqueror, Triumph, Legend: Alacrity, Coup de Grace)";
        runes.secondary = "Inspiration (Magical Footwear, Cosmic Insight)";
        build = ["Sundered Sky", "The Black Cleaver", "Sterak's Gage"];
    } else if (isTank) {
        runes.primary = "Resolve (Grasp of the Undying, Demolish, Bone Plating, Overgrowth)";
        runes.secondary = "Precision (Triumph, Legend: Tenacity)";
        build = ["Sunfire Aegis", "Heartsteel", "Warmog's Armor"];
    } else if (isMage) {
        runes.primary = "Sorcery (Arcane Comet, Manaflow Band, Transcendence, Scorch)";
        runes.secondary = "Inspiration (Magical Footwear, Cosmic Insight)";
        build = ["Luden's Companion", "Liandry's Torment", "Rabadon's Deathcap"];
    } else if (isAD) {
        runes.primary = "Precision (Press the Attack, Triumph, Legend: Alacrity, Coup de Grace)";
        runes.secondary = "Domination (Taste of Blood, Treasure Hunter)";
        build = ["Kraken Slayer", "Infinity Edge", "Lord Dominik's Regards"];
    }

    // Append situational counter-items
    if (mainThreat === "AD") {
        if (isMage) build.push("Zhonya's Hourglass", "Void Staff", "Morellonomicon");
        else if (isTank || isBruiser) build.push("Thornmail", "Randuin's Omen", "Death's Dance");
        else build.push("Guardian Angel", "The Collector", "Death's Dance");
    } else if (mainThreat === "AP") {
        if (isMage) build.push("Banshee's Veil", "Void Staff", "Shadowflame");
        else if (isTank || isBruiser) build.push("Force of Nature", "Spirit Visage", "Locket of the Iron Solari");
        else build.push("Maw of Malmortius", "Wit's End", "Mercurial Scimitar");
    } else {
        if (isMage) build.push("Zhonya's Hourglass", "Void Staff", "Liandry's Torment");
        else if (isTank || isBruiser) build.push("Jak'Sho, The Protean", "Thornmail", "Force of Nature");
        else build.push("Terminus", "Guardian Angel", "Bloodthirster");
    }

    let spells = ["SummonerFlash"]; 
    if (lane === "Jungle") spells.push("SummonerSmite");
    else if (lane === "Top" && (isTank || isBruiser)) spells.push("SummonerTeleport");
    else if (lane === "Bot") spells.push("SummonerHeal");
    else if (lane === "Support") spells.push("SummonerExhaust");
    else spells.push("SummonerDot"); 

    let boots = "Plated Steelcaps";
    if (mainThreat === "AP") boots = "Mercury's Treads";
    if (isMage && mainThreat === "Mixed") boots = "Sorcerer's Shoes";
    if (isAD && mainThreat === "Mixed") boots = "Berserker's Greaves";

    if (lane === "Support") build.unshift("World Atlas");

    let resultBuild = [...build];
    if (lane === "Bot") resultBuild.push(boots);
    else resultBuild.unshift(boots);

    return { build: resultBuild.slice(0, lane === "Bot" ? 7 : 6), runes, spells };
}

document.addEventListener('DOMContentLoaded', () => {
    fetchData();

    const calculateBtn = document.getElementById('calculate-btn');
    const resultBox = document.getElementById('result');
    const itemGrid = document.getElementById('item-build');
    const runeContainer = document.getElementById('rune-setup');
    const summonerContainer = document.getElementById('summoner-spells');
    const adviceText = document.getElementById('advice-text');
    const adBar = document.getElementById('ad-bar');
    const apBar = document.getElementById('ap-bar');
    const resultChampImg = document.getElementById('result-champ-img');

    calculateBtn.addEventListener('click', () => {
        const userChampKey = document.getElementById('user-champion').value;
        const userLane = document.getElementById('user-lane').value;
        const userChamp = allChampions[userChampKey];

        const enemySelects = document.querySelectorAll('.enemy-select');
        let adCount = 0;
        let apCount = 0;
        let selectedCount = 0;
        let enemyHtml = "<h4>Enemy Composition:</h4><div style='display:flex; gap:10px; flex-wrap:wrap;'>";

        enemySelects.forEach(select => {
            const key = select.value;
            if (key) {
                selectedCount++;
                const champ = allChampions[key];
                if (champ.info.magic > champ.info.attack) apCount++;
                else adCount++;
                
                enemyHtml += `
                    <div style="display:flex; align-items:center; gap:5px; background: rgba(0,0,0,0.3); padding:5px; border-radius:20px;">
                        <img src="https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${key}.png" class="champ-icon-small">
                        <span style="font-size:0.8rem;">${champ.name}</span>
                    </div>
                `;
            }
        });
        enemyHtml += "</div>";

        if (selectedCount === 0) {
            alert("Please select at least one enemy.");
            return;
        }

        document.body.style.backgroundImage = `url('https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${userChampKey}_0.jpg')`;
        resultChampImg.src = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${userChampKey}.png`;

        const adPercent = (adCount / selectedCount) * 100;
        const apPercent = (apCount / selectedCount) * 100;
        adBar.style.width = `${adPercent}%`;
        apBar.style.width = `${apPercent}%`;

        const mainThreat = adCount > apCount ? "AD" : (apCount > adCount ? "AP" : "Mixed");
        const advies = getBuildAdvies(userChamp, userLane, mainThreat);

        // Render Items
        itemGrid.innerHTML = "";
        advies.build.forEach((itemName) => {
            const itemId = findItemIdByName(itemName);
            const slot = document.createElement('div');
            slot.className = 'item-slot';
            
            if (itemId) {
                const rawDesc = allItems[itemId].description;
                const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '');
                slot.title = `${allItems[itemId].name}\n\n${cleanDesc}`;
                slot.innerHTML = `<img src="https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/item/${itemId}.png" class="item-icon"><span>${itemName}</span>`;
            } else {
                slot.innerHTML = `<span>${itemName}</span>`;
            }
            itemGrid.appendChild(slot);
        });

        // Render Summoner Spells
        summonerContainer.innerHTML = "";
        advies.spells.forEach(spellKey => {
            const img = document.createElement('img');
            img.src = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/spell/${spellKey}.png`;
            img.className = 'summoner-icon';
            img.title = allSpells[spellKey].name;
            summonerContainer.appendChild(img);
        });

        // Render Runes
        runeContainer.innerHTML = `
            <div class="rune-tree"><h5>Primary</h5><p>${advies.runes.primary}</p></div>
            <div class="rune-tree"><h5>Secondary</h5><p>${advies.runes.secondary}</p></div>
        `;

        adviceText.innerHTML = `
            <p>Based on your role as ${userChamp.tags.join('/')} and the ${mainThreat} threat, this is the optimal setup for ${userLane}.</p>
            ${enemyHtml}
        `;
        
        resultBox.style.display = 'block';
        resultBox.scrollIntoView({ behavior: 'smooth' });
    });
});
