import { workspaceMemberService } from "./workspace-member.service.js";

const addMember = async (req, res) => {
  try {
    const { workspaceId } = req.validatedData.params;
    const payload = req.validatedData.body;

    const response = await workspaceMemberService.addMemberSvc({
      workspaceId,
      payload,
    });

    if (!response.success) {
      if (response.code === "DUPLICATE_USER" || response.code === "ALREADY_MEMBER") {
        return res.status(409).json(response);
      }
      const status =
        response.code === "NOT_ORG_MEMBER" || response.code === "INVALID_ROLE" ? 400 : 404;
      return res.status(status).json(response);
    }

    return res.status(201).json(response);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message: "User with this email or username is already registered or a member.",
      });
    }
    return res.status(500).json({
      success: false,
      message: "Failed to add member to workspace.",
    });
  }
};

const getMembers = async (req, res) => {
  try {
    const { workspaceId } = req.validatedData.params;
    const response = await workspaceMemberService.getMembersSvc(workspaceId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch workspace members.",
    });
  }
};

const updateMemberRole = async (req, res) => {
  try {
    const { workspaceId, userId } = req.validatedData.params;
    const { roleId } = req.validatedData.body;

    const response = await workspaceMemberService.updateMemberRoleSvc({
      workspaceId,
      userId,
      roleId,
    });

    if (!response.success) {
      const status = response.code === "INVALID_ROLE" ? 400 : 404;
      return res.status(status).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update member role.",
    });
  }
};

const removeMember = async (req, res) => {
  try {
    const { workspaceId, userId } = req.validatedData.params;
    const response = await workspaceMemberService.removeMemberSvc({
      workspaceId,
      userId,
    });

    if (!response.success) {
      return res.status(404).json(response);
    }

    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove member from workspace.",
    });
  }
};

export const workspaceMemberController = {
  addMember,
  getMembers,
  updateMemberRole,
  removeMember,
};
