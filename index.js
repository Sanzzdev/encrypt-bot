
const fs = require('fs');
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const obfuscateCode = require('./JSTools');
const axios = require('axios');
const { TOKEN } = require('./config');
const bot = new Telegraf(TOKEN);
let userSessions = {};
const app = express();
const port = 3000;

const asciiArt = `令 SUCCES CONNECT`;
console.log(asciiArt);


bot.use((ctx, next) => {
    const name = ctx.from.first_name || ctx.from.username;
    const message = ctx.message?.text || ctx.callbackQuery?.data;
    if (message) {
        console.log(`令 GET [ ${name} ] : ${message}`);
    }
    return next();
});

bot.start((ctx) => {
    ctx.replyWithPhoto('https://files.catbox.moe/zm441h.jpg', {
        caption: '令 BOT NEOCRYPT | XLANZ AND JACK',
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('令 ENCRYPT LIST', 'obfmenu')],
            [Markup.button.callback('令 STATUS PREM', 'status')]
        ])
    });
});

bot.action('obfmenu', (ctx) => {
    ctx.replyWithPhoto('https://files.catbox.moe/zm441h.jpg', {
        caption: 'PLEASE CHOOSE WHICH LEVEL YOU WANT',
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([
            [Markup.button.callback('ENCRYPT LEVEL 1', 'obf1')],
            [Markup.button.callback('ENCRYPT LEVEL 2', 'obf2')],
            [Markup.button.callback('ENCRYPT LEVEL 3', 'obf3')],
            [Markup.button.callback('ENCRYPT LEVEL 4', 'obf4')],
            [Markup.button.callback('ENCRYPT LEVEL 5', 'obf5')],
            [Markup.button.callback('ENCRYPT LEVEL 6', 'obf6')],
            [Markup.button.callback('ENCRYPT LEVEL 7', 'obf7')],
            [Markup.button.callback('ENCRYPT LEVEL 8', 'obf8')]
        ])
    });
});


const obfuscationTypes = {
    obf1: 'Var Obfuscation - HardObf',
    obf2: 'Hexadecimal Obfuscation - ExtremeObf',
    obf3: 'DeadCode Obfuscation - ExtremeObf',
    obf4: 'EncCode Obfuscation - ExtremeObf',
    obf5: 'ABCD Obfuscation - HardObf',
    obf6: 'Name Obfuscation - ExtremeObf',
    obf7: 'Mangled Obfuscation - Various Types',
    obf8: 'Crass Obfuscation - HardObf'
};

Object.keys(obfuscationTypes).forEach((key) => {
    bot.action(key, (ctx) => {
        const obfuscationType = obfuscationTypes[key];
        const userId = ctx.from.id;
        userSessions[userId] = { obfuscationType: key };
        
        ctx.reply(`SEND YOUR JAVASCRIPT FILE [ YourFile.js ].`, {
            parse_mode: 'Markdown'
        });
    });
});

bot.on('document', async (ctx) => {
    const userId = ctx.from.id;
    const fileName = ctx.message.document.file_name;

    if (!fileName.endsWith('.js')) {
        return ctx.reply('令 PLEASE SEND FILE IN .JS FORMAT');
    }

    if (!userSessions[userId] || !userSessions[userId].obfuscationType) {
        return ctx.reply('令 PLEASE SELECT ENCRYPT TYPE');
    }
    const obfuscationType = userSessions[userId].obfuscationType;
    console.log(`Obfuscating ${fileName} for user ${ctx.from.first_name} (${userId}) using ${obfuscationType}`);
    await handleDocumentObfuscation(ctx, obfuscationType);
});

async function handleDocumentObfuscation(ctx, option) {
    const fileId = ctx.message.document.file_id;
    const loadingMessage = await ctx.reply('令 READING YOUR FILE...');

    try {
        const fileLink = await ctx.telegram.getFileLink(fileId);
        const code = await downloadFile(fileLink);
        await ctx.telegram.editMessageText(ctx.chat.id, loadingMessage.message_id, undefined, '令 PROSESS ENCRYPT');
        const obfuscatedCode = await obfuscateCode(code, option);

        await ctx.telegram.editMessageText(ctx.chat.id, loadingMessage.message_id, undefined, '令 SUCCESS ENCRYPT');
        await ctx.replyWithDocument({ source: Buffer.from(obfuscatedCode), filename: 'xlanzdev.js' }, {
            caption: `TYPE ENC : ${option}\nCREATOR : XLANDEV\nMSG : THANK YOU FOR USING BOT `,
            parse_mode: 'Markdown'
        });

    } catch (error) {
        console.error('Error during obfuscation process:', error);
        await ctx.telegram.editMessageText(ctx.chat.id, loadingMessage.message_id, undefined, 'Encrypt Gagal diProses.');
    }
}

async function downloadFile(fileLink) {
    try {
        const response = await axios.get(fileLink);
        return response.data;
    } catch (error) {
        console.error('Error downloading:', error);
        throw new Error('Failed to download');
    }
}
bot.launch();
process.removeAllListeners('warning');
process.env.NODE_NO_WARNINGS = '1';

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`);
});