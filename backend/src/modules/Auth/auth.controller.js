const showRegisterPage = async (req, res) => {
  res.render("auth/views/register");
};
const showLoginPage = async (req, res) => {
  res.render("auth/views/login");
};

const register = async (req, res) => {
  console.log("Register Controller");
  console.log(req.body);

  return res.send("Register Working");
};

const login = async () => {};

const logout = async () => {};

export const authController = {
  showRegisterPage,
  showLoginPage,
  register,
  login,
  logout,
};
