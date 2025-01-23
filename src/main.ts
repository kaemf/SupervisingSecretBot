// Supervising Bot
// Developed by Yaroslav Volkivskyi (TheLaidSon)

// Actual v1.0B

// Main File

import arch from "./base/architecture";
import dotenv from "dotenv";
import Start from "./data/steps/Start";
import AARootHandler from "./data/steps/AARootHandler";
import PaymentHandler from "./data/steps/PaymentHandler";
import { RegularCheckSubscription } from "./base/subscription";

dotenv.config();

async function main() {
  const [ onTextMessage, bot, db ] = await arch();

  await RegularCheckSubscription(bot.telegram, db);

  await Start(bot, db);

  await AARootHandler(onTextMessage, db);

  await PaymentHandler(onTextMessage, db);

  bot.launch();
}

main();