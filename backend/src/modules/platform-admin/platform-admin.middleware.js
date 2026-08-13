import { platformAdminRepository } from "./platform-admin.repository.js";

export const authenticatePlatformAdmin = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthenticated.",
      });
    }

    const isAdmin = await platformAdminRepository.isPlatformAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Platform Admin privileges required.",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error verifying platform admin status.",
    });
  }
};
