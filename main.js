import ethers from "ethers";
import abiDecoder from "abi-decoder";
import { Telegraf } from "telegraf";
import {
  provider,
  filter,
  filterId,
  routerAbi,
  ethSwaps,
  iface,
  routerAddress,
  tokenContract,
} from "./scanner_config.js";
import { insert_token, fetch_tokens, delete_token } from "./database.js";
import { botToken, parseMessage, parseMsg } from "./bot_config.js";
abiDecoder.addABI(routerAbi);
const bot = new Telegraf(botToken);

// The bot is being Launched here
bot.start((ctx) => {
  console.log(ctx, "ok");
  ctx.reply(
    "Hi, I am BuyBot I send notification of buys of your token to your telegram group. Add me to your group to start\n\nTo monitor new tokens use \n/add_token {token contract address}\nTo remove token use \n/remove_token {token contract address}"
  );
});

//a command to add a token
bot.command("add_token", async (ctx) => {
  let token = await parseMessage(ctx);
  console.log(ctx.message.chat.id);
  if (!token) return;
  let is_token = ethers.utils.isAddress(token);
  if (!is_token) {
    ctx.reply("Invalid Token Address");
    return;
  }
  try {
    token = ethers.utils.getAddress(token);
    let symbol = await tokenContract.attach(token).symbol();
    console.log(await tokenContract.attach(token).name());
    let decimals = await tokenContract.attach(token).decimals();
    await insert_token(token, ctx.message.chat.id, decimals, symbol);
    ctx.reply(`Monitoring The Buys of ${symbol}`);
  } catch (err) {
    console.log(err);
    ctx.reply("Invalid Token");
    return;
  }
});

//command to remove a token
bot.command("remove_token", async (ctx) => {
  let admins = await ctx.telegram.getChatAdministrators(ctx.message.chat.id);
  const is_admin = admins.filter(
    (admin) => admin.user.id === ctx.message.from.id
  );

  if (is_admin.length === 0) {
    ctx.reply("Only Admins Can Remove Tokens");
    return;
  }
  const text = ctx.update.message.text.trim();
  let [_, token] = text.split(" ");

  if (!ethers.utils.isAddress(token)) {
    ctx.reply("Invalid Token");
    return;
  }
  let res = await delete_token(
    ethers.utils.getAddress(token),
    ctx.message.chat.id
  );
  console.log(ctx.message.chat.id);
  console.log(ethers.utils.getAddress(token));
  ctx.reply("Token Removed");
});

// command to launch the bot
bot.launch();
console.log("Launched");

const main = async () => {
  init();
};

const init = async () => {
  console.log("Starting Main Scanner");
  try {
    provider.on(filter, async (log) => {
      let trx = await provider.getTransaction(log.transactionHash);
      if (trx.to !== routerAddress) return;
      let trxData = abiDecoder.decodeMethod(trx.data);
      if (ethSwaps.indexOf(trxData.name) === -1) return;
      let path = trxData.params[1].value;
      let outToken = ethers.utils.getAddress(path[path.length - 1]);

      const token_details = await fetch_tokens(outToken);
      if (token_details.length === 0) return;

      let decimals = await tokenContract.attach(outToken).decimals();
      let data = await provider.getTransactionReceipt(log.transactionHash);
      let lastLog = data.logs[data.logs.length - 1];
      if (lastLog.topics[0] != filterId) return;
      if (lastLog.logIndex !== log.logIndex) return;

      let logdata = iface.parseLog(lastLog).args;
      let out = logdata.amount1Out.gte(logdata.amount0Out)
        ? logdata.amount1Out
        : logdata.amount0Out;
      out = ethers.utils.formatUnits(out, decimals).toString();
      let spend = ethers.utils.formatUnits(trx.value, "ether").toString();

      for (var token_detail of token_details) {
        let msg = parseMsg(token_detail, trx.hash, log.address, spend, out);
        console.log(msg);
        await bot.telegram.sendAnimation(
          token_detail.group_id,
          "CgACAgQAAxkBAAEKhFxjN-9k2O3egn6RfLTat0Rh4V4m-gACQg4AAg98wFEMDDDTvYWPFioE",
          { caption: msg, parse_mode: "HTML" }
        );
      }

      console.log(trx.hash);

      console.log(
        "============================================================"
      );
    });
  } catch (err) {
    // setTimeout(main, 7000);
    console.log("An Error Occured", err);
  }
  provider.on("error", (error) => {
    console.log("Error occured");
    console.log(error);
  });
};
main();

process.on("uncaughtException", (err) => {
  console.log("Unknown Error Occured");
  console.log(err);
  // setTimeout(main, 30000);
});
