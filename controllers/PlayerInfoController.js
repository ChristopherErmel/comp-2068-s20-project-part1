const PlayerInfo = require('../models/playerInfo');
const User = require('../models/User');
const puppeteer = require('puppeteer');
const fs = require('fs');
const https = require('https');
const moment = require('moment');

exports.console = async (req, res) => {
    //for usertype tracking
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    //This will only allow the page to load if the user is a super user
    if(user.userType === 'super'){
        res.render('superUser/console', {
            user: user
        })
    }else{
        req.flash('danger', 'You need to login as a Super User to access that page.');
      return res.redirect('/login');
    }
    
};

const sleep = async time => {
    return new Promise(resolve => {
        return setTimeout(resolve, time * 1000);
    })
}

exports.currentPlayers = async (req, res) => {
     //for usertype tracking
     let user = "undefined"
     if (typeof req.user != "undefined") {
       user = await User.findById(req.user);
     }

     const playerInfos = await PlayerInfo.find();
     const playerInfosG = await PlayerInfo.find({"postition": "G"});
     const allUsers = await User.find();
     const allProUsers = await User.find({"userType": "pro"});
     const lastUserCreated = await User.find().sort({"createdAt": -1}).limit(1);
     const lastPlayerCreated = await PlayerInfo.find().sort({"createdAt": -1}).limit(1);
     
     const playerInfosCardTypes = await PlayerInfo.distinct('card');

     let amountOfPlayers = playerInfos.length;
     let amountOfUsers = allUsers.length;
     let amountOfProUsers = allProUsers.length;
     let amountOfGoalies = playerInfosG.length;

     let amountOfSkaters = amountOfPlayers - amountOfGoalies;
     
     
    // console.log(lastPlayerCreated);


     //This will only allow the page to load if the user is a super user
    if(user.userType === 'super'){
        res.render('superUser/currentPlayers', {
            playerInfos,
            amountOfPlayers,
            playerInfosCardTypes,
            amountOfUsers,
            lastUserCreated,
            lastPlayerCreated,
            amountOfProUsers,
            amountOfGoalies,
            amountOfSkaters,
            user: user,
            moment: moment
        })
    }else{
        req.flash('danger', 'You need to login as a Super User to access that page.');
      return res.redirect('/login');
    }   
    
};

exports.update = async (req, res) => {

    //for usertype tracking
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    //This will only allow the page to load if the user is a super user
    if(user.userType === 'super'){

    let pgNum = req.query.pageNumber - 1;

    const playerInfos = await scrapeIt('https://www.nhlhutbuilder.com/player-stats.php', pgNum);

    for (let playerInfo of playerInfos) {
        //update our PlayerInfo model with the data
        await PlayerInfo.updateOne({
            //its finding the cardid if its there... else create it, main
            cardID: playerInfo.cardID,
            playerImageLink: playerInfo.imageURLId,
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


    res.redirect('/superUser/currentPlayers');
   
       
    }else{
        req.flash('danger', 'You need to login as a Super User to access that page.');
      return res.redirect('/login');
    }  

    
};


async function scrapeIt(url, pageNumber) {
    const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(url, ['geolocation']);


    //create our page
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.setDefaultNavigationTimeout(0); 
    
    page.on('dialog', async dialog => await dialog.dismiss());
    page.on('console', msg => console.log(msg._text));
    //uses function in scrapper pages...
    await page.exposeFunction('sleep', sleep);


    await page.goto(url);
    await sleep(1);
    // await page.screenshot({ path: 'screenshots/check.png' });
    await page.evaluate(async () => {
        window.scrollBy(0, document.body.scrollWidth);
        await sleep(.5);
        window.scrollBy(0, document.body.scrollHeight);
        await sleep(.5);
    });


    


    await page.waitForSelector(`[class="table display compact hover stripe dataTable"]`, { visible: true, timeout: 120 });


    //array of all card info urls
    let playerInfoUrls = [];



    
    //this will run depending on the amourn of pages there are...
    for (let i = 0; i < pageNumber; i++) {  

        // page.waitForNavigation({ waitUntil: 'domcontentloaded' });
        // await page.waitForSelector('#paginate_button current', {visible: true})
        
        const hrefs = await page.$$eval('.advanced-stats', elements => elements.map(el => el.href))
        //const urls = hrefs.map(el => siteUrl + el)

        for (const url of hrefs) {
            // await page.goto(url)
            // await page.screenshot({ path: url + '.png' })
            //console.log(url);
            playerInfoUrls.push(url);
        }

        await page.evaluate(async () => {
            const nextButton = document.querySelector('#players_table_next');
            nextButton.click();                
        await sleep(10);                   
        });

        
        // let t = i+1;
        //wait for the current page to update. 
        // await page.waitForFunction('document.getElementsByClassName("current")[0].innerText = '+t);
        // await page.waitFor(() => );
        
        //tracking of pages
        console.log("Page#:" + i);
    }

    //array of all cards and their infos...
    const playerInfos = [];
   


    //bringing in the download function for images...
    await page.exposeFunction('download', download);

    //for tracking progess
let x = 0;

let uniqueplayerInfoUrls = [...new Set(playerInfoUrls)];

    for (const url of playerInfoUrls) {
 //for tracking progess
console.log(x + "/" + uniqueplayerInfoUrls.length);
 //for tracking progess
x++;


        //go to and load page first.
        await page.goto(url, {waitUntil: 'domcontentloaded'});
        // await sleep(1);

        //grabbing all player info...
       let playerInfoB4 = await page.evaluate(async () => {            

            const playerName = document.querySelector('#player_header').innerText;
            const card = document.querySelector("#player_bio_table > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
            const postition = document.querySelector("#player_bio_table > tbody > tr:nth-child(14) > td:nth-child(1)").innerText;
            const playerType = document.querySelector("#player_bio_table > tbody > tr:nth-child(5) > td:nth-child(2)").innerText;
            const handedness = document.querySelector("#player_bio_table > tbody > tr:nth-child(14) > td:nth-child(2)").innerText;
            const height = document.querySelector("#player_bio_table > tbody > tr:nth-child(17) > td:nth-child(2)").innerText;
            const weight = document.querySelector("#player_bio_table > tbody > tr:nth-child(17) > td:nth-child(1)").innerText;
            const overall = document.querySelector("#player_bio_table > tbody > tr:nth-child(2) > td:nth-child(1)").innerText;
            const averageOverAll = document.querySelector("#average_overall").innerText;
            const acceleration = document.querySelector("#acceleration").innerText;
            const agility = document.querySelector("#agility").innerText;
            const balance = document.querySelector("#balance").innerText;
            const endurance = document.querySelector("#endurance").innerText;
            const speed = document.querySelector("#speed").innerText;
            const slapShotAccuracy = document.querySelector("#slap_shot_accuracy").innerText;
            const slapShotPower = document.querySelector("#slap_shot_power").innerText;
            const wristShotAccuracy = document.querySelector("#wrist_shot_accuracy").innerText;
            const wristShotPower = document.querySelector("#wrist_shot_power").innerText;
            const deking = document.querySelector("#deking").innerText;
            const offensiveAwareness = document.querySelector("#off_awareness").innerText;
            const handEye = document.querySelector("#hand-eye").innerText;
            const passing = document.querySelector("#passing").innerText;
            const puckControl = document.querySelector("#puck_control").innerText;
            const bodyChecking = document.querySelector("#body_checking").innerText;
            const strength = document.querySelector("#strength").innerText;
            const aggression = document.querySelector("#aggression").innerText;
            const durability = document.querySelector("#durability").innerText;
            const fightingSkill = document.querySelector("#fighting_skill").innerText;
            const defensiveAwareness = document.querySelector("#def_awareness").innerText;
            const shotBlocking = document.querySelector("#shot_blocking").innerText;
            const stickChecking = document.querySelector("#stick_checking").innerText;
            const faceOffs = document.querySelector("#faceoffs").innerText;
            const discipline = document.querySelector("#discipline").innerText;

            let synergies = "";
            //grabbing the syns
            for (const syn of document.querySelector(".syn_group").children) {
                //console.log(syn.className);
                const parts = syn.className.split('_');
                // console.log(parts[parts.length - 1]);
                synergies = synergies + `${parts[parts.length - 1]} `;
            }

            //grabbing image url
            const imageURL = document.querySelector("#card_art").src;
            const urlParts = imageURL.split('/');
            const imageURLId = urlParts[urlParts.length - 1];

            //pass the url to the download function. 
            //it will download the image and save it to the dir based on the id.
            await download(imageURL, `./assets/playerCardImages/${imageURLId}`);
            

            //Grabbing the card ID
            const cardID = imageURLId.split('.').slice(0, -1).join('.');        
            

            //setting all the information to the playerInfos array.
            //sending data back
           return playerInfoB4 = ({ cardID, imageURLId, synergies, playerName, card, postition, playerType, height, weight, handedness, overall, averageOverAll, deking, handEye, passing, puckControl, slapShotAccuracy, slapShotPower, wristShotAccuracy, wristShotPower, acceleration, agility, balance, endurance, speed, discipline, offensiveAwareness, defensiveAwareness, faceOffs, shotBlocking, stickChecking, aggression, bodyChecking, durability, fightingSkill, strength });

        });
        //push the player data into the array or all player data.
        playerInfos.push(playerInfoB4);
    }
    //when done, close the browser and return the data...
    await browser.close();
    return playerInfos;
}






exports.updateGoalies = async (req, res) => {

    //for usertype tracking
    let user = "undefined"
    if (typeof req.user != "undefined") {
      user = await User.findById(req.user);
    }

    //This will only allow the page to load if the user is a super user
    if(user.userType === 'super'){

    let pgNum = req.query.pageNumber - 1;

    const playerInfos = await scrapeItG('https://www.nhlhutbuilder.com/goalie-stats.php', pgNum);


    
    for (let playerInfo of playerInfos) {
        //update our PlayerInfo model with the data
        await PlayerInfo.updateOne({
            //its finding the cardid if its there... else create it, main            
            cardID: playerInfo.cardID,
            playerImageLink: playerInfo.imageURLId,
            playerName: playerInfo.playerName,
            card: playerInfo.card,
            postition: playerInfo.postition,
            height: playerInfo.height,
            weight: playerInfo.weight,
            playerType: playerInfo.playerType,
            handedness: playerInfo.handedness,
            synergies: playerInfo.synergies,
            overall: playerInfo.overall,
            gloveHigh: playerInfo.gloveHigh,
            stickHigh: playerInfo.stickHigh,
            gloveLow: playerInfo.gloveLow,
            stickLow: playerInfo.stickLow,
            pokeCheck: playerInfo.pokeCheck,
            passing: playerInfo.passing,
            speed: playerInfo.speed,
            vision: playerInfo.vision,
            agility: playerInfo.agility,
            positioning: playerInfo.positioning,
            fiveHole: playerInfo.fiveHole,
            breakaway: playerInfo.breakaway,
            aggression: playerInfo.aggression,
            reboundControll: playerInfo.reboundControll,
            shotRecovery: playerInfo.shotRecovery
        },
            playerInfo,
            {
                upsert: true
            }
        )
    }


    res.redirect('/superUser/currentPlayers');
   
       
    }else{
        req.flash('danger', 'You need to login as a Super User to access that page.');
      return res.redirect('/login');
    }  

    
};


async function scrapeItG(url, pageNumber) {
    const browser = await puppeteer.launch({ headless: true, ignoreHTTPSErrors: true });
    const context = browser.defaultBrowserContext();
    await context.overridePermissions(url, ['geolocation']);


    //create our page
    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    await page.setDefaultNavigationTimeout(0);

    page.on('dialog', async dialog => await dialog.dismiss());
    page.on('console', msg => console.log(msg._text));
    //uses function in scrapper pages...
    await page.exposeFunction('sleep', sleep);


    await page.goto(url, {waitUntil: 'domcontentloaded'});
    // await sleep(1);
    // await page.screenshot({ path: 'screenshots/check.png' });
    await page.evaluate(async () => {
        window.scrollBy(0, document.body.scrollWidth);
        await sleep(.5);
        window.scrollBy(0, document.body.scrollHeight);
        await sleep(.5);
    });

    await page.waitForSelector(`[class="table display compact hover stripe dataTable"]`, { visible: true, timeout: 120 });


    //array of all card info urls
    let playerInfoUrls = [];

//l

    
    //this will run depending on the amourn of pages there are...
    for (let i = 0; i < pageNumber; i++) {
        const hrefs = await page.$$eval('.advanced-stats', elements => elements.map(el => el.href))
        //const urls = hrefs.map(el => siteUrl + el)

        for (const url of hrefs) {
            // await page.goto(url)
            // await page.screenshot({ path: url + '.png' })
            //console.log(url);
            playerInfoUrls.push(url);
        }

        await page.evaluate(async () => {
            const nextButton = document.querySelector('#players_table_next');
            nextButton.click();
            await sleep(10);
        });

        //tracking of pages
        console.log("Page#:" + i);
    }

    //array of all cards and their infos...
    const playerInfos = [];
   


    //bringing in the download function for images...
    await page.exposeFunction('download', download);









 

        //go to and load page first.
        await page.goto(url, {waitUntil: 'domcontentloaded'});
        // await sleep(1);





        //for tracking progess
        let x = 0;
        
        let uniqueplayerInfoUrls = [...new Set(playerInfoUrls)];
        


    for (const url of playerInfoUrls) {


        //for tracking progess
console.log(x + "/" + uniqueplayerInfoUrls.length);
//for tracking progess
        x++;



        //go to and load page first.
        await page.goto(url, {waitUntil: 'domcontentloaded'});

        //grabbing all player info...
       let playerInfoB4 = await page.evaluate(async () => {            
        
            const playerName = document.querySelector('#player_header').innerText;
            const card = document.querySelector("#player_bio_table > tbody > tr:nth-child(2) > td:nth-child(2)").innerText;
            const postition = document.querySelector("#player_bio_table > tbody > tr:nth-child(14) > td:nth-child(1)").innerText;
            const playerType = document.querySelector("#player_bio_table > tbody > tr:nth-child(5) > td:nth-child(2)").innerText;
           
            const handedness = document.querySelector("#player_bio_table > tbody > tr:nth-child(14) > td:nth-child(2)").innerText;
            const height = document.querySelector("#player_bio_table > tbody > tr:nth-child(17) > td:nth-child(2)").innerText;
            const weight = document.querySelector("#player_bio_table > tbody > tr:nth-child(17) > td:nth-child(1)").innerText;
           
            
            const overall = document.querySelector("#player_bio_table > tbody > tr:nth-child(2) > td:nth-child(1)").innerText;
            // const averageOverAll = document.querySelector("#average_overall").innerText;
            const gloveHigh = document.querySelector("#player_bio_stats > table:nth-child(1) > tbody > tr:nth-child(1) > td.stat").innerText;
            const stickHigh = document.querySelector("#player_bio_stats > table:nth-child(1) > tbody > tr:nth-child(2) > td.stat").innerText;
            const gloveLow = document.querySelector("#player_bio_stats > table:nth-child(2) > tbody > tr:nth-child(1) > td.stat").innerText;
            const stickLow = document.querySelector("#player_bio_stats > table:nth-child(2) > tbody > tr:nth-child(2) > td.stat").innerText;
            const pokeCheck = document.querySelector("#player_bio_stats > table:nth-child(2) > tbody > tr:nth-child(3) > td.stat").innerText;
            const passing = document.querySelector("#player_bio_stats > table:nth-child(2) > tbody > tr:nth-child(4) > td.stat").innerText;
            const speed = document.querySelector("#player_bio_stats > table:nth-child(5) > tbody > tr:nth-child(1) > td.stat").innerText;
            const vision = document.querySelector("#player_bio_stats > table:nth-child(5) > tbody > tr:nth-child(2) > td.stat").innerText;
            const agility = document.querySelector("#player_bio_stats > table:nth-child(5) > tbody > tr:nth-child(3) > td.stat").innerText;
            const positioning = document.querySelector("#player_bio_stats > table:nth-child(6) > tbody > tr:nth-child(1) > td.stat").innerText;
            const fiveHole = document.querySelector("#player_bio_stats > table:nth-child(6) > tbody > tr:nth-child(2) > td.stat").innerText;
            const breakaway = document.querySelector("#player_bio_stats > table:nth-child(6) > tbody > tr:nth-child(3) > td.stat").innerText;
            const aggression = document.querySelector("#player_bio_stats > table:nth-child(9) > tbody > tr:nth-child(1) > td.stat").innerText;
            const reboundControll = document.querySelector("#player_bio_stats > table:nth-child(9) > tbody > tr:nth-child(2) > td.stat").innerText;
            const shotRecovery = document.querySelector("#player_bio_stats > table:nth-child(9) > tbody > tr:nth-child(3) > td.stat").innerText;
           

            let synergies = "";
            //grabbing the syns
            for (const syn of document.querySelector(".syn_group").children) {
                //console.log(syn.className);
                const parts = syn.className.split('_');
                // console.log(parts[parts.length - 1]);
                synergies = synergies + `${parts[parts.length - 1]} `;
            }

            //grabbing image url
            const imageURL = document.querySelector("#card_art").src;
            const urlParts = imageURL.split('/');
            const imageURLId = urlParts[urlParts.length - 1];

            //pass the url to the download function. 
            //it will download the image and save it to the dir based on the id.
            await download(imageURL, `./assets/playerCardImages/${imageURLId}`);
            

            //Grabbing the card ID
            const cardID = imageURLId.split('.').slice(0, -1).join('.');        
            

            //setting all the information to the playerInfos array.
            //sending data back
           return playerInfoB4 = ({ cardID, imageURLId, aggression, synergies, playerName, card, postition, playerType, handedness, height, weight, overall, gloveHigh, stickHigh, gloveLow, stickLow, pokeCheck, passing, speed, vision, agility, positioning, fiveHole, breakaway, reboundControll, shotRecovery });

        });
        //push the player data into the array or all player data.
        playerInfos.push(playerInfoB4);
    }
    //when done, close the browser and return the data...
    await browser.close();
    return playerInfos;
}

























 //this will download the images and save them.
 const download = (url, destination) => new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);
  
    https.get(url, response => {
      response.pipe(file);
  
      file.on('finish', () => {
        file.close(resolve(true));
      });
    }).on('error', error => {
      fs.unlink(destination);
  
      reject(error.message);
    });
  });
