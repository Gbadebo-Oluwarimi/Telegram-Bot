import { checkExist } from "./database.js";
import ethers from "ethers";
export const botToken = "5619312285:AAHpadW_2AxT6h43wTeKr91W9gC2tbmmz-o";

export const parseMessage = async (ctx) => {
  let chatType = ctx.message.chat.type;
  console.log(chatType);
  if (chatType === "private") {
    ctx.reply("Can't do this here\nAdd me to your group");
    return;
  }

  const text = ctx.update.message.text;
  let [_, token] = text.trim().split(" ");
  if (!token) {
    ctx.reply("No token Supplied");
    return;
  } else if (!ethers.utils.isAddress(token)) {
    ctx.reply("Invalid Token Supplied");
    return;
  }
  let exists = await checkExist(
    ethers.utils.getAddress(token),
    ctx.message.chat.id
  );

  if (exists.length != 0) {
    ctx.reply("Token Already Registed");
    return;
  }

  let admins = await ctx.telegram.getChatAdministrators(ctx.message.chat.id);
  const is_admin = admins.filter(
    (admin) => admin.user.id === ctx.message.from.id
  );

  if (is_admin.length === 0) {
    ctx.reply("Only Admins Can Add New Tokens");
  } else {
    return token;
  }
};

// {/* <a href= 'https://bscscan.com/address/${details.token_address}'>Buyer Position: </a> ⬆️ 7.33%! */}
export const parseMsg = (details, trxhash, pair, spend, got) => {
  let msg = `<b>${details.symbol} Buy </b>! 
🟢🟢
Spent: ${spend} BNB 
Got: <strong>${got}</strong> ${details.symbol}
DEX: PancakeSwap
Price: ${spend / got} BNB
<a href='https://bscscan.com/tx/${trxhash}'>TX </a> | \
<a href= 'https://pancakeswap.finance/swap?inputCurrency=0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c&outputCurrency=${
    details.token_address
  }'>Buy </a> | \
<a href= 'https://www.dextools.io/app/bsc/pair-explorer/${pair}'>Chart </a>`;
  return msg;
};
