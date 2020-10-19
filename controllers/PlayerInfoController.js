const PlayerInfo = require('../models/playerInfo');
const puppeteer = require('puppeteer');

const sleep = async time => {
    return new Promise(resolve => {
        return setTimeout(resolve, time * 1000);
    })
}

exports.index = async (req, res) => {
    const playerInfos = await PlayerInfo.find();
    res.render('playerInfo/index', {
        pageTitle: 'PlayerInfo',
        playerInfos
    })
};

exports.update = async (req, res) => {
    const playerInfos = await scrapeIt('https://www.nhlhutbuilder.com/player-stats.php');

    for (let playerInfo of playerInfos) {
        //if empty then ignore it
        if (playerInfo.id === "" || playerInfo.playerName === "") continue;
        //other wise, update our PlayerInfo model with the data
        await PlayerInfo.updateOne({
            //its finding the cardid if its there... else create it, main
            cardID: playerInfo.cardID,
            playerName: playerInfo.playerName,
            card: playerInfo.card,
            postition: playerInfo.postition,
            height: playerInfo.height,
            weight: playerInfo.weight,
            playerType: playerInfo.playerType,
            handedness: playerInfo.handedness,
            synergies: playerInfo.synergies,
            overall: playerInfo.overall,
            averageOverAll: playerInfo.averageOverAll,
            deking: playerInfo.deking,
            handEye: playerInfo.handEye,
            passing: playerInfo.passing,
            puckControl: playerInfo.puckControl,
            slapShotAccuracy: playerInfo.slapShotAccuracy,
            slapShotPower: playerInfo.slapShotPower,
            wristShotAccuracy: playerInfo.wristShotAccuracy,
            wristShotPower: playerInfo.wristShotPower,
            acceleration: playerInfo.acceleration,
            agility: playerInfo.agility,
            balance: playerInfo.balance,
            endurance: playerInfo.endurance,
            speed: playerInfo.speed,
            discipline: playerInfo.discipline,
            offensiveAwareness: playerInfo.offensiveAwareness,
            defensiveAwareness: playerInfo.defensiveAwareness,
            faceOffs: playerInfo.faceOffs,
            shotBlocking: playerInfo.shotBlocking,
            stickChecking: playerInfo.stickChecking,
            aggression: playerInfo.aggression,
            bodyChecking: playerInfo.bodyChecking,
            durability: playerInfo.durability,
            fightingSkill: playerInfo.fightingSkill,
            strength: playerInfo.strength
        },
            playerInfo,
            {
                upsert: true
            }
        )
    }

  //  res.json(playerInfos);

    res.redirect('/playerInfo');
};

async function scrapeIt(url) {
    const browser = await puppeteer.launch({ headless: false });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(url, ['geolocation']);


    //create our page
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    page.on('dialog', async dialog => await dialog.dismiss());
    page.on('console', msg => console.log(msg._text));
    //uses function in scrapper pages...
    await page.exposeFunction('sleep', sleep);


    await page.goto(url);
    await sleep(5);
    await page.screenshot({ path: 'screenshots/check.png' });
    await page.evaluate(async () => {
        window.scrollBy(0, document.body.scrollWidth);
        await sleep(2);
        window.scrollBy(0, document.body.scrollHeight);
        await sleep(2);
    });

    await page.waitForSelector(`[class="table display compact hover stripe dataTable"]`, { visible: true, timeout: 120 });

    const nextTable = true;

    //do {
        const content = await page.evaluate(async () => {

            const nextButton = document.querySelector('#players_table_next');
            let currentPage = document.querySelector('.paginate_button.current').innerText;


            const playerScrape = document.querySelectorAll('.odd, .even');

            const playerInfos = [];
           

            //console.log("Player Info Count: ", playerScrape.length);
            for (let playerInfo of playerScrape) {
                //info grabbing
                const card = playerInfo.childNodes[0].innerText;
                const postition = playerInfo.childNodes[1].innerText;
                const playerType = playerInfo.childNodes[2].innerText;
                const handedness = playerInfo.childNodes[3].innerText;
                const height = playerInfo.childNodes[4].innerText;
                const weight = playerInfo.childNodes[5].innerText;
                const playerName = playerInfo.childNodes[6].innerText;
                const synergies = playerInfo.childNodes[7].innerText;
                const overall = playerInfo.childNodes[8].innerText;
                const averageOverAll = playerInfo.childNodes[9].innerText;
                
                const acceleration = playerInfo.childNodes[10].innerText;
                const agility = playerInfo.childNodes[11].innerText;
                const balance = playerInfo.childNodes[12].innerText;
                const endurance = playerInfo.childNodes[13].innerText;
                const speed = playerInfo.childNodes[14].innerText;
                const slapShotAccuracy = playerInfo.childNodes[15].innerText;
                const slapShotPower = playerInfo.childNodes[16].innerText;
                const wristShotAccuracy = playerInfo.childNodes[17].innerText;
                const wristShotPower = playerInfo.childNodes[18].innerText;
                const deking = playerInfo.childNodes[19].innerText;
                const offensiveAwareness = playerInfo.childNodes[20].innerText;
                const handEye = playerInfo.childNodes[21].innerText;
                const passing = playerInfo.childNodes[22].innerText;
                const puckControl = playerInfo.childNodes[23].innerText;
                const bodyChecking = playerInfo.childNodes[24].innerText;
                const strength = playerInfo.childNodes[25].innerText;
                const aggression = playerInfo.childNodes[26].innerText;
                const durability = playerInfo.childNodes[27].innerText;
                const fightingSkill = playerInfo.childNodes[28].innerText;
                const defensiveAwareness = playerInfo.childNodes[29].innerText;
                const shotBlocking = playerInfo.childNodes[30].innerText;
                const stickChecking = playerInfo.childNodes[31].innerText;
                const faceOffs = playerInfo.childNodes[32].innerText;
                const discipline = playerInfo.childNodes[33].innerText;
               
                

                 
                //grabbing the image url
                const image = playerInfo.childNodes[6].children[0].href;
                const parts = image.split('=');
                const cardID = parts[parts.length - 1];

                

                playerInfos.push({ cardID, playerName, card, postition, playerType, height, weight, handedness, synergies, overall, averageOverAll, deking, handEye, passing, puckControl, slapShotAccuracy, slapShotPower, wristShotAccuracy, wristShotPower, acceleration, agility, balance, endurance, speed, discipline, offensiveAwareness, defensiveAwareness, faceOffs, shotBlocking, stickChecking, aggression, bodyChecking, durability, fightingSkill, strength });
            }

            //page number to go to...
            if (currentPage === "2") {                
                await browser.close();
                nextTable === false;
                return playerInfos;
            } else {
                await nextButton.click();
                await sleep(2);
                return playerInfos;
            }
        });

   // } while (nextTable);    
   return content;
}