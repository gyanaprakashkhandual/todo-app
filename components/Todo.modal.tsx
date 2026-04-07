import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Modal, Portal } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { Todo, TodoRequest, Priority, TodoStatus } from "../types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../constants";
import { useColors } from "@/hooks/useColor";

interface TodoFormModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (req: TodoRequest) => Promise<void>;
  initial?: Todo | null;
  defaultStatus?: TodoStatus;
}

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const STATUSES: TodoStatus[] = [
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const empty: TodoRequest = {
  title: "",
  description: "",
  notes: "",
  refLink: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  priority: "MEDIUM",
  status: "PENDING",
  tags: [],
};

export default function TodoFormModal({
  visible,
  onClose,
  onSubmit,
  initial,
  defaultStatus = "PENDING",
}: TodoFormModalProps) {
  const colors = useColors();
  const [form, setForm] = useState<TodoRequest>({
    ...empty,
    status: defaultStatus,
  });
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      if (initial) {
        setForm({
          title: initial.title,
          description: initial.description || "",
          notes: initial.notes || "",
          refLink: initial.refLink || "",
          startDate: initial.startDate || "",
          endDate: initial.endDate || "",
          startTime: initial.startTime || "",
          endTime: initial.endTime || "",
          priority: initial.priority,
          status: initial.status,
          tags: [...(initial.tags || [])],
        });
      } else {
        setForm({ ...empty, status: defaultStatus });
      }
      setTagInput("");
      setErrors({});
    }
  }, [visible, initial, defaultStatus]);

  const update = (field: keyof TodoRequest, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field])
      setErrors((prev) => {
        const e = { ...prev };
        delete e[field];
        return e;
      });
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      update("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    update(
      "tags",
      form.tags.filter((t) => t !== tag),
    );
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Title is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        description: form.description?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        refLink: form.refLink?.trim() || undefined,
        startDate: form.startDate?.trim() || undefined,
        endDate: form.endDate?.trim() || undefined,
        startTime: form.startTime?.trim() || undefined,
        endTime: form.endTime?.trim() || undefined,
      });
      onClose();
    } catch {
      // error handled upstream
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={s.modalContainer}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          {/* Header */}
          <View style={s.header}>
            <Text style={s.headerTitle}>
              {initial ? "Edit Task" : "New Task"}
            </Text>
            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
              <MaterialCommunityIcons
                name="close"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.body}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Title */}
            <View style={s.field}>
              <Text style={s.label}>Title *</Text>
              <TextInput
                style={[s.input, errors.title && s.inputError]}
                placeholder="Task title..."
                placeholderTextColor={colors.textMuted}
                value={form.title}
                onChangeText={(v) => update("title", v)}
              />
              {errors.title && <Text style={s.errorText}>{errors.title}</Text>}
            </View>

            {/* Description */}
            <View style={s.field}>
              <Text style={s.label}>Description</Text>
              <TextInput
                style={[s.input, s.textArea]}
                placeholder="Add a description..."
                placeholderTextColor={colors.textMuted}
                value={form.description}
                onChangeText={(v) => update("description", v)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Notes */}
            <View style={s.field}>
              <Text style={s.label}>Notes</Text>
              <TextInput
                style={[s.input, s.textArea]}
                placeholder="Additional notes..."
                placeholderTextColor={colors.textMuted}
                value={form.notes}
                onChangeText={(v) => update("notes", v)}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            {/* Priority */}
            <View style={s.field}>
              <Text style={s.label}>Priority</Text>
              <View style={s.chipRow}>
                {PRIORITIES.map((p) => {
                  const pc = PRIORITY_CONFIG[p];
                  const selected = form.priority === p;
                  return (
                    <TouchableOpacity
                      key={p}
                      onPress={() => update("priority", p)}
                      style={[
                        s.chip,
                        {
                          backgroundColor: selected
                            ? colors.isDark
                              ? pc.bgColorDark
                              : pc.bgColor
                            : colors.surfaceElevated,
                          borderColor: selected ? pc.color : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.chipText,
                          { color: selected ? pc.color : colors.textSecondary },
                        ]}
                      >
                        {pc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Status */}
            <View style={s.field}>
              <Text style={s.label}>Status</Text>
              <View style={s.chipRow}>
                {STATUSES.map((st) => {
                  const sc = STATUS_CONFIG[st];
                  const selected = form.status === st;
                  return (
                    <TouchableOpacity
                      key={st}
                      onPress={() => update("status", st)}
                      style={[
                        s.chip,
                        {
                          backgroundColor: selected
                            ? colors.isDark
                              ? sc.bgColorDark
                              : sc.bgColor
                            : colors.surfaceElevated,
                          borderColor: selected ? sc.dotColor : colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          s.chipText,
                          { color: selected ? sc.color : colors.textSecondary },
                        ]}
                      >
                        {sc.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Dates row */}
            <View style={s.rowFields}>
              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Start Date</Text>
                <TextInput
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={form.startDate}
                  onChangeText={(v) => update("startDate", v)}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Due Date</Text>
                <TextInput
                  style={s.input}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textMuted}
                  value={form.endDate}
                  onChangeText={(v) => update("endDate", v)}
                />
              </View>
            </View>

            {/* Time row */}
            <View style={s.rowFields}>
              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>Start Time</Text>
                <TextInput
                  style={s.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={form.startTime}
                  onChangeText={(v) => update("startTime", v)}
                />
              </View>
              <View style={{ width: 12 }} />
              <View style={[s.field, { flex: 1 }]}>
                <Text style={s.label}>End Time</Text>
                <TextInput
                  style={s.input}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textMuted}
                  value={form.endTime}
                  onChangeText={(v) => update("endTime", v)}
                />
              </View>
            </View>

            {/* Ref Link */}
            <View style={s.field}>
              <Text style={s.label}>Reference Link</Text>
              <TextInput
                style={s.input}
                placeholder="https://..."
                placeholderTextColor={colors.textMuted}
                value={form.refLink}
                onChangeText={(v) => update("refLink", v)}
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            {/* Tags */}
            <View style={s.field}>
              <Text style={s.label}>Tags</Text>
              <View style={s.tagInputRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Add tag..."
                  placeholderTextColor={colors.textMuted}
                  value={tagInput}
                  onChangeText={setTagInput}
                  onSubmitEditing={addTag}
                  returnKeyType="done"
                />
                <TouchableOpacity
                  onPress={addTag}
                  style={[s.addTagBtn, { backgroundColor: colors.primary }]}
                >
                  <Text style={[s.addTagBtnText, { color: colors.primaryFg }]}>
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
              {form.tags.length > 0 && (
                <View style={s.tagsWrap}>
                  {form.tags.map((tag) => (
                    <View
                      key={tag}
                      style={[
                        s.tagChip,
                        {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[s.tagChipText, { color: colors.textSecondary }]}
                      >
                        {tag}
                      </Text>
                      <TouchableOpacity onPress={() => removeTag(tag)}>
                        <MaterialCommunityIcons
                          name="close"
                          size={12}
                          color={colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={{ height: 24 }} />
          </ScrollView>

          {/* Footer */}
          <View style={[s.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[s.cancelBtn, { borderColor: colors.border }]}
            >
              <Text style={[s.cancelBtnText, { color: colors.textSecondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={[
                s.submitBtn,
                { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 },
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={colors.primaryFg} />
              ) : (
                <Text style={[s.submitBtnText, { color: colors.primaryFg }]}>
                  {initial ? "Save Changes" : "Create Task"}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </Portal>
  );
}

const styles = (
  colors: ReturnType<typeof import("../hooks/useColor").useColors>,
) =>
  StyleSheet.create({
    modalContainer: {
      backgroundColor: colors.surface,
      margin: 16,
      borderRadius: 20,
      maxHeight: "90%",
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: { fontSize: 17, fontWeight: "700", color: colors.text },
    closeBtn: { padding: 4 },

    body: { paddingHorizontal: 20, paddingTop: 16 },

    field: { marginBottom: 16 },
    rowFields: { flexDirection: "row" },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    input: {
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text,
      marginBottom: 0,
    },
    inputError: { borderColor: colors.danger },
    textArea: { minHeight: 72 },
    errorText: { fontSize: 11, color: colors.danger, marginTop: 4 },

    chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    chip: {
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 8,
      borderWidth: 1.5,
    },
    chipText: { fontSize: 12, fontWeight: "600" },

    tagInputRow: { flexDirection: "row", gap: 8, alignItems: "center" },
    addTagBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
    addTagBtnText: { fontSize: 13, fontWeight: "600" },
    tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 10 },
    tagChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
      borderWidth: 1,
    },
    tagChipText: { fontSize: 12, fontWeight: "500" },

    footer: {
      flexDirection: "row",
      gap: 10,
      padding: 16,
      borderTopWidth: 1,
    },
    cancelBtn: {
      flex: 1,
      padding: 13,
      borderRadius: 12,
      borderWidth: 1,
      alignItems: "center",
    },
    cancelBtnText: { fontSize: 14, fontWeight: "600" },
    submitBtn: {
      flex: 2,
      padding: 13,
      borderRadius: 12,
      alignItems: "center",
    },
    submitBtnText: { fontSize: 14, fontWeight: "700" },
  });
