import { db } from './config';
import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp } from 'firebase/firestore';

export async function logAudit({ resource, resourceId, action, changedBy, changedByEmail, before, after }) {
  try {
    const logsRef = collection(db, 'auditLogs');
    await addDoc(logsRef, {
      resource,
      resourceId,
      action,
      changedBy,
      changedByEmail,
      before: before || null,
      after: after || null,
      timestamp: Timestamp.now()
    });
  } catch (error) {
    console.error("Failed to log audit event:", error);
    // Fire and forget, don't throw
  }
}

export async function getAuditLogs(logLimit = 50) {
  const q = query(
    collection(db, 'auditLogs'),
    orderBy('timestamp', 'desc'),
    limit(logLimit)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
