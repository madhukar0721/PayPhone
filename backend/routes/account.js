const express = require("express");
const { authMiddleware } = require("../middleware");
const { Account } = require("../db/db");
const { default: mongoose } = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
  try {
    const userId = req.userId;
    const account = await Account.findOne({
      userId: userId,
    });

    return res.status(200).json({
      message: "Balance fetched Successfully",
      balance: account.balance,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// from userId1 -> usr2
router.post("/transferFunds", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { amountToSend, recepientUserId } = req.body;

    const senderAccount = await Account.findOne({
      userId: req.userId,
    }).session(session);

    if (!senderAccount || senderAccount.balance < amountToSend) {
      await session.abortTransaction();
      return res.status(400).json({ error: "Insufficient Balance" });
    }

    const recepientAccount = await Account.findOne({
      userId: recepientUserId,
    }).session(session);

    console.log(recepientAccount)
    console.log(senderAccount)
    if(senderAccount.userId.equals(recepientAccount.userId))
    {
      await session.abortTransaction();
      return res.status(400).json({ error: "Sender and Recepient can not be same" });
    }

    if (!recepientAccount) {
      await session.abortTransaction();
      return res.status(404).json({ error: "Wrong Recipient Id" });
    }

    await senderAccount
      .updateOne({ $inc: { balance: -amountToSend } })
      .session(session);

    await recepientAccount
      .updateOne({ $inc: { balance: amountToSend } })
      .session(session);

    await session.commitTransaction();

    return res.status(200).json({ message: "Transfer Successful" });
  } 
  catch (error) {
    
    await session.abortTransaction();
    console.error("Transaction failed:", error);

    return res.status(500).json({ error: "Internal Server Error" });
  } 
  finally {
    session.endSession();
  }
});

module.exports = router;
