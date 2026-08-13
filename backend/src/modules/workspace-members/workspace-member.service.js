import bcrypt from "bcrypt";
import { workspaceMemberRepository } from "./workspace-member.repository.js";

const addMemberSvc = async ({ workspaceId, payload }) => {
  const { isExisting, firstName, lastName, username, email, password, roleId } = payload;

  let result;

  if (isExisting || (!firstName && !password && email)) {
    // Add existing organization member by email
    result = await workspaceMemberRepository.addExistingMemberByEmail({
      workspaceId,
      email,
      roleId,
    });
  } else {
    // Create new member user account + organization membership + workspace membership
    const passwordHash = await bcrypt.hash(password, 12);
    result = await workspaceMemberRepository.createAndAddMember({
      workspaceId,
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      roleId,
    });
  }

  if (!result.success) {
    return {
      success: false,
      code: result.code,
      message: result.message,
    };
  }

  return {
    success: true,
    message: "Workspace member added successfully.",
    member: result.member,
  };
};

const getMembersSvc = async (workspaceId) => {
  const members = await workspaceMemberRepository.getMembers(workspaceId);

  return {
    success: true,
    members,
  };
};

const updateMemberRoleSvc = async ({ workspaceId, userId, roleId }) => {
  const result = await workspaceMemberRepository.updateMemberRole({
    workspaceId,
    userId,
    roleId,
  });

  if (!result.success) {
    return {
      success: false,
      code: result.code,
      message: result.message,
    };
  }

  return {
    success: true,
    message: "Workspace member role updated successfully.",
    member: result.member,
  };
};

const removeMemberSvc = async ({ workspaceId, userId }) => {
  const result = await workspaceMemberRepository.removeMember({
    workspaceId,
    userId,
  });

  if (!result.success) {
    return {
      success: false,
      code: result.code,
      message: result.message,
    };
  }

  return {
    success: true,
    message: "Member removed from workspace successfully.",
  };
};

export const workspaceMemberService = {
  addMemberSvc,
  getMembersSvc,
  updateMemberRoleSvc,
  removeMemberSvc,
};
