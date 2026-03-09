/**
 * Data Integrity Guard Hook
 * 
 * This hook provides a convenient way to integrate data integrity checks
 * into admin CRUD operations with user-friendly feedback.
 */

import { useState } from "react";
import { toast } from "sonner";
import { useDataIntegrity, IntegrityCheckResult } from "@/lib/dataIntegrity";

interface IntegrityGuardOptions {
  showWarningsAsToasts?: boolean;
  confirmDeletionWithWarnings?: boolean;
  blockOperationOnErrors?: boolean;
}

export function useDataIntegrityGuard(options: IntegrityGuardOptions = {}) {
  const {
    showWarningsAsToasts = true,
    confirmDeletionWithWarnings = true,
    blockOperationOnErrors = true,
  } = options;

  const [isValidating, setIsValidating] = useState(false);
  const integrity = useDataIntegrity();

  /**
   * Validates an entity before save operations
   */
  const validateBeforeSave = async (
    entityType: string,
    entityData: Record<string, any>
  ): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const result = await integrity.validateEntityIntegrity(entityType, entityData);
      
      // Show errors
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        if (blockOperationOnErrors) {
          return false;
        }
      }
      
      // Show warnings
      if (showWarningsAsToasts && result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.warning(warning));
      }
      
      return result.isValid || !blockOperationOnErrors;
    } catch (error) {
      toast.error("Failed to validate data integrity");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Validates before delete operations with user confirmation
   */
  const validateBeforeDelete = async (
    entityType: string,
    entityId: number,
    entityName?: string
  ): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const result = await integrity.checkDeletionImpact(entityType, entityId);
      
      // Show errors
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        if (blockOperationOnErrors) {
          return false;
        }
      }
      
      // Handle warnings with confirmation
      if (result.warnings.length > 0) {
        if (showWarningsAsToasts) {
          result.warnings.forEach(warning => toast.warning(warning));
        }
        
        if (confirmDeletionWithWarnings) {
          const warningMessage = result.warnings.join("\n");
          const confirmMessage = `${entityName ? `Delete "${entityName}"` : "Delete this item"}?\n\nWarnings:\n${warningMessage}\n\nThis action cannot be undone.`;
          
          return confirm(confirmMessage);
        }
      }
      
      return true;
    } catch (error) {
      toast.error("Failed to validate deletion impact");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Validates role changes for users
   */
  const validateRoleChange = async (
    userId: number,
    newRole: string,
    userName?: string
  ): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const result = await integrity.validateRoleChange(userId, newRole);
      
      // Show errors
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        if (blockOperationOnErrors) {
          return false;
        }
      }
      
      // Show warnings
      if (showWarningsAsToasts && result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.warning(warning));
      }
      
      // Confirm role change if there are warnings
      if (result.warnings.length > 0 && confirmDeletionWithWarnings) {
        const warningMessage = result.warnings.join("\n");
        const confirmMessage = `Change role for ${userName || "this user"} to "${newRole}"?\n\nWarnings:\n${warningMessage}`;
        
        return confirm(confirmMessage);
      }
      
      return true;
    } catch (error) {
      toast.error("Failed to validate role change");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Validates foreign key references
   */
  const validateReference = async (
    entityType: string,
    fieldName: string,
    fieldValue: number | null | undefined
  ): Promise<boolean> => {
    if (!fieldValue) return true;
    
    setIsValidating(true);
    
    try {
      const result = await integrity.validateForeignKeyReference(entityType, fieldName, fieldValue);
      
      // Show errors
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        return false;
      }
      
      // Show warnings
      if (showWarningsAsToasts && result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.warning(warning));
      }
      
      return result.isValid;
    } catch (error) {
      toast.error("Failed to validate reference");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Performs cleanup after deletion
   */
  const performCleanup = async (
    entityType: string,
    entityId: number
  ): Promise<boolean> => {
    setIsValidating(true);
    
    try {
      const result = await integrity.performIntegrityCleanup(entityType, entityId);
      
      // Show cleanup results
      if (result.warnings.length > 0) {
        result.warnings.forEach(warning => toast.info(warning));
      }
      
      if (result.errors.length > 0) {
        result.errors.forEach(error => toast.error(error));
        return false;
      }
      
      return result.isValid;
    } catch (error) {
      toast.error("Failed to perform cleanup");
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  /**
   * Wraps a mutation with integrity checks
   */
  const withIntegrityCheck = <T extends any[]>(
    operation: (...args: T) => Promise<any>,
    checkType: "save" | "delete" | "roleChange",
    entityType: string,
    getEntityData?: (...args: T) => { id?: number; name?: string; data?: Record<string, any>; newRole?: string }
  ) => {
    return async (...args: T) => {
      const entityInfo = getEntityData ? getEntityData(...args) : {};
      
      let canProceed = true;
      
      switch (checkType) {
        case "save":
          if (entityInfo.data) {
            canProceed = await validateBeforeSave(entityType, entityInfo.data);
          }
          break;
        case "delete":
          if (entityInfo.id !== undefined) {
            canProceed = await validateBeforeDelete(entityType, entityInfo.id, entityInfo.name);
          }
          break;
        case "roleChange":
          if (entityInfo.id !== undefined && entityInfo.newRole) {
            canProceed = await validateRoleChange(entityInfo.id, entityInfo.newRole, entityInfo.name);
          }
          break;
      }
      
      if (!canProceed) {
        return Promise.reject(new Error("Operation cancelled due to integrity check"));
      }
      
      const result = await operation(...args);
      
      // Perform cleanup after successful deletion
      if (checkType === "delete" && entityInfo.id !== undefined) {
        await performCleanup(entityType, entityInfo.id);
      }
      
      return result;
    };
  };

  return {
    isValidating,
    validateBeforeSave,
    validateBeforeDelete,
    validateRoleChange,
    validateReference,
    performCleanup,
    withIntegrityCheck,
  };
}