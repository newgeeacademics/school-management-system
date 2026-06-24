enum PortalRole { student, parent, teacher }

PortalRole? backendRoleToPortal(String role) {
  switch (role.toUpperCase()) {
    case 'STUDENT':
      return PortalRole.student;
    case 'PARENT':
      return PortalRole.parent;
    case 'TEACHER':
      return PortalRole.teacher;
    default:
      return null;
  }
}

String portalRoleLabel(PortalRole role) {
  switch (role) {
    case PortalRole.student:
      return 'Élève';
    case PortalRole.parent:
      return 'Parent';
    case PortalRole.teacher:
      return 'Enseignant';
  }
}
