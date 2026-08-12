import { Router } from "express";
import { userRepository } from "./user.repository.js";

const userRouter = Router();

userRouter.get("/:id", async (req, res) => {
  const{ id }= req.params;
  console.log(id);
  const user = await userRepository.findUserById(id)
  return res.status(300).json({ message: "done",user });
});

export default userRouter;
