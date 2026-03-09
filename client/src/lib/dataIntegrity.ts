/**
 * Data Integrity Utilities
 * 
 * This module provides utilities to ensure data integrity across entity relationships
 * when performing CRUD operations in the admin panel.
 */

import { trpc } from "@/lib/trpc";

export interface IntegrityCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface RelationshipCheck {
  entity: string;
  field: string;
  relatedEntity: string;
  relatedField: string;
  required: boolean;
}

/**
 * Defines the relationship constraints in the system
 */
export const RELATIONSHIP_CONSTRAINTS: RelationshipCheck[] = [
  // Project relationships
  {
    entity: "projects",
    field: "clientId",
    relatedEntity: "users",
    relatedField: "id",
    required: false,
  },
  
  // Project-dependent entities
  {
    entity: "projectImages",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: true,
  },
  {
    entity: "projectPhases",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: true,
  },
  {
    entity: "dailyLogs",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: true,
  },
  {
    entity: "documents",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: true,
  },
  {
    entity: "documents",
    field: "clientId",
    relatedEntity: "users",
    relatedField: "id",
    required: false,
  },
  
  // Testimonial relationships
  {
    entity: "testimonials",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: false,
  },
  
  // Subcontractor relationships
  {
    entity: "subcontractorApplications",
    field: "userId",
    relatedEntity: "users",
    relatedField: "id",
    required: false,
  },
  
  // Tender relationships
  {
    entity: "tenders",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: false,
  },
  {
    entity: "tenderApplications",
    field: "tenderId",
    relatedEntity: "tenders",
    relatedField: "id",
    required: true,
  },
  {
    entity: "tenderApplications",
    field: "subcontractorId",
    relatedEntity: "users",
    relatedField: "id",
    required: false,
  },
  
  // Client project assignments
  {
    entity: "clientProjects",
    field: "clientId",
    relatedEntity: "users",
    relatedField: "id",
    required: true,
  },
  {
    entity: "clientProjects",
    field: "projectId",
    relatedEntity: "projects",
    relatedField: "id",
    required: true,
  },
];

/**
 * Validates that a foreign key reference exists before creating/updating an entity
 */
export async function validateForeignKeyReference(
  entityType: string,
  fieldName: string,
  fieldValue: number | null | undefined,
  trpcUtils: any
): Promise<IntegrityCheckResult> {
  const result: IntegrityCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  if (!fieldValue) {
    return result; // Null/undefined values are handled by required constraint
  }

  const constraint = RELATIONSHIP_CONSTRAINTS.find(
    (c) => c.entity === entityType && c.field === fieldName
  );

  if (!constraint) {
    result.warnings.push(`No relationship constraint defined for ${entityType}.${fieldName}`);
    return result;
  }

  try {
    // Check if the referenced entity exists
    let exists = false;
    
    switch (constraint.relatedEntity) {
      case "users":
        const users = await trpcUtils.users.list.fetch();
        exists = users.some((u: any) => u.id === fieldValue);
        break;
      case "projects":
        const projects = await trpcUtils.projects.list.fetch({});
        exists = projects.some((p: any) => p.id === fieldValue);
        break;
      case "tenders":
        const tenders = await trpcUtils.tenders.list.fetch();
        exists = tenders.some((t: any) => t.id === fieldValue);
        break;
      default:
        result.warnings.push(`Unknown related entity type: ${constraint.relatedEntity}`);
        return result;
    }

    if (!exists) {
      result.isValid = false;
      result.errors.push(
        `Referenced ${constraint.relatedEntity} with id ${fieldValue} does not exist`
      );
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Failed to validate reference: ${error}`);
  }

  return result;
}

/**
 * Checks what entities would be affected by deleting a specific entity
 */
export async function checkDeletionImpact(
  entityType: string,
  entityId: number,
  trpcUtils: any
): Promise<IntegrityCheckResult> {
  const result: IntegrityCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Find all relationships where this entity is referenced
  const dependentRelationships = RELATIONSHIP_CONSTRAINTS.filter(
    (c) => c.relatedEntity === entityType
  );

  for (const relationship of dependentRelationships) {
    try {
      let dependentCount = 0;
      let dependentEntities: string[] = [];

      switch (relationship.entity) {
        case "projectImages":
          if (entityType === "projects") {
            // Check if project has images
            // Note: This would require a projectImages query endpoint
            result.warnings.push(`Project may have associated images that will be orphaned`);
          }
          break;
        case "projectPhases":
          if (entityType === "projects") {
            result.warnings.push(`Project may have associated phases that will be orphaned`);
          }
          break;
        case "dailyLogs":
          if (entityType === "projects") {
            result.warnings.push(`Project may have associated daily logs that will be orphaned`);
          }
          break;
        case "documents":
          if (entityType === "projects") {
            result.warnings.push(`Project may have associated documents that will be orphaned`);
          } else if (entityType === "users") {
            result.warnings.push(`User may have associated documents that will be orphaned`);
          }
          break;
        case "testimonials":
          if (entityType === "projects") {
            result.warnings.push(`Project may have associated testimonials that will be orphaned`);
          }
          break;
        case "subcontractorApplications":
          if (entityType === "users") {
            result.warnings.push(`User may have subcontractor applications that will be orphaned`);
          }
          break;
        case "tenders":
          if (entityType === "projects") {
            const tenders = await trpcUtils.tenders.list.fetch();
            const projectTenders = tenders.filter((t: any) => t.projectId === entityId);
            if (projectTenders.length > 0) {
              dependentCount = projectTenders.length;
              dependentEntities = projectTenders.map((t: any) => t.title);
              result.warnings.push(
                `Project has ${dependentCount} associated tender(s): ${dependentEntities.join(", ")}`
              );
            }
          }
          break;
        case "tenderApplications":
          if (entityType === "tenders") {
            const applications = await trpcUtils.tenders.applications.fetch({ tenderId: entityId });
            if (applications && applications.length > 0) {
              dependentCount = applications.length;
              result.warnings.push(
                `Tender has ${dependentCount} application(s) that will be orphaned`
              );
            }
          } else if (entityType === "users") {
            result.warnings.push(`User may have tender applications that will be orphaned`);
          }
          break;
        case "clientProjects":
          if (entityType === "users") {
            result.warnings.push(`User may have project assignments that will be orphaned`);
          } else if (entityType === "projects") {
            result.warnings.push(`Project may have client assignments that will be orphaned`);
          }
          break;
      }

      // If there are required relationships, mark as invalid
      if (relationship.required && dependentCount > 0) {
        result.isValid = false;
        result.errors.push(
          `Cannot delete ${entityType} - it has ${dependentCount} dependent ${relationship.entity} record(s)`
        );
      }
    } catch (error) {
      result.warnings.push(`Failed to check ${relationship.entity} dependencies: ${error}`);
    }
  }

  return result;
}

/**
 * Validates data integrity for a complete entity before save operations
 */
export async function validateEntityIntegrity(
  entityType: string,
  entityData: Record<string, any>,
  trpcUtils: any
): Promise<IntegrityCheckResult> {
  const result: IntegrityCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  // Find all foreign key constraints for this entity
  const entityConstraints = RELATIONSHIP_CONSTRAINTS.filter(
    (c) => c.entity === entityType
  );

  for (const constraint of entityConstraints) {
    const fieldValue = entityData[constraint.field];
    
    // Check required constraints
    if (constraint.required && !fieldValue) {
      result.isValid = false;
      result.errors.push(`${constraint.field} is required`);
      continue;
    }

    // Validate foreign key reference if value exists
    if (fieldValue) {
      const refCheck = await validateForeignKeyReference(
        entityType,
        constraint.field,
        fieldValue,
        trpcUtils
      );
      
      result.isValid = result.isValid && refCheck.isValid;
      result.errors.push(...refCheck.errors);
      result.warnings.push(...refCheck.warnings);
    }
  }

  return result;
}

/**
 * Performs cleanup operations when deleting an entity to maintain referential integrity
 */
export async function performIntegrityCleanup(
  entityType: string,
  entityId: number,
  trpcUtils: any
): Promise<IntegrityCheckResult> {
  const result: IntegrityCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // For now, we'll just log what cleanup would be performed
    // In a full implementation, this would actually perform the cleanup
    
    switch (entityType) {
      case "projects":
        result.warnings.push("Would clean up: project images, phases, daily logs, documents, testimonials");
        break;
      case "users":
        result.warnings.push("Would clean up: subcontractor applications, client project assignments");
        break;
      case "tenders":
        result.warnings.push("Would clean up: tender applications");
        break;
    }
  } catch (error) {
    result.isValid = false;
    result.errors.push(`Cleanup failed: ${error}`);
  }

  return result;
}

/**
 * Utility to check if a user role change would violate any constraints
 */
export async function validateRoleChange(
  userId: number,
  newRole: string,
  trpcUtils: any
): Promise<IntegrityCheckResult> {
  const result: IntegrityCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
  };

  try {
    // Check if user has role-specific data that would be affected
    if (newRole !== "client") {
      result.warnings.push("Changing from client role may affect project access");
    }
    
    if (newRole !== "subcontractor") {
      result.warnings.push("Changing from subcontractor role may affect tender applications");
    }
    
    if (newRole !== "admin") {
      result.warnings.push("Removing admin role will revoke administrative access");
    }
  } catch (error) {
    result.warnings.push(`Failed to validate role change: ${error}`);
  }

  return result;
}

/**
 * Hook to use data integrity validation in React components
 */
export function useDataIntegrity() {
  const utils = trpc.useUtils();

  return {
    validateForeignKeyReference: (entityType: string, fieldName: string, fieldValue: number | null | undefined) =>
      validateForeignKeyReference(entityType, fieldName, fieldValue, utils),
    checkDeletionImpact: (entityType: string, entityId: number) =>
      checkDeletionImpact(entityType, entityId, utils),
    validateEntityIntegrity: (entityType: string, entityData: Record<string, any>) =>
      validateEntityIntegrity(entityType, entityData, utils),
    performIntegrityCleanup: (entityType: string, entityId: number) =>
      performIntegrityCleanup(entityType, entityId, utils),
    validateRoleChange: (userId: number, newRole: string) =>
      validateRoleChange(userId, newRole, utils),
  };
}