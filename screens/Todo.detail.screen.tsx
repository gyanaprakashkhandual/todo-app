import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useNavigation,
  useRoute,
  type RouteProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppDispatch, useAppSelector } from "../lib/store";
import {
  fetchTodos,
  fetchStats,
  fetchTags,
  updateTodo,
  deleteTodo,
} from "../lib/todo.slice";
import { useColors } from "../hooks/useColor";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../constants";
import TodoFormModal from "@/components/Todo.modal";
import type { Todo, TodoRequest, RootStackParamList } from "../types";

type DetailRoute = RouteProp<RootStackParamList, "TodoDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    },
  );
}

function formatTime(t?: string) {
  if (!t) return null;
  const [h, m] = t.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m));
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isOverdue(endDate?: string, status?: string) {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED")
    return false;
  return new Date(endDate) < new Date();
}

function SectionLabel({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: any;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        marginBottom: 10,
      }}
    >
      <MaterialCommunityIcons
        name={icon as any}
        size={14}
        color={colors.textMuted}
      />
      <Text
        style={{
          fontSize: 10,
          fontWeight: "700",
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: colors.textMuted,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

export default function TodoDetailScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const route = useRoute<DetailRoute>();
  const { todoId } = route.params;
  const colors = useColors();

  const { todos, loading } = useAppSelector((s) => s.todos);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [formVisible, setFormVisible] = useState(false);

  useEffect(() => {
    if (todos.length === 0) {
      dispatch(fetchTodos({ size: 100 }));
      dispatch(fetchStats());
      dispatch(fetchTags());
    }
  }, [dispatch]);

  const todo = todos.find((t) => t.id === todoId);
  const pc = todo ? PRIORITY_CONFIG[todo.priority] : null;
  const sc = todo ? STATUS_CONFIG[todo.status] : null;
  const overdue = isOverdue(todo?.endDate, todo?.status);
  const startDate = formatDate(todo?.startDate);
  const endDate = formatDate(todo?.endDate);
  const startTime = formatTime(todo?.startTime);
  const endTime = formatTime(todo?.endTime);

  const handleEdit = () => {
    if (!todo) return;
    setEditingTodo(todo);
    setFormVisible(true);
  };

  const handleDelete = () => {
    if (!todo) return;
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await dispatch(deleteTodo(todo.id)).unwrap();
            dispatch(fetchStats());
            navigation.goBack();
          },
        },
      ],
    );
  };

  const handleSubmit = async (req: TodoRequest) => {
    if (!editingTodo) return;
    await dispatch(updateTodo({ id: editingTodo.id, req })).unwrap();
    dispatch(fetchStats());
    dispatch(fetchTags());
    setFormVisible(false);
    setEditingTodo(null);
  };

  const s = styles(colors);

  if (loading && todos.length === 0) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!todo) {
    return (
      <SafeAreaView style={s.container} edges={["top"]}>
        <View style={s.notFound}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={40}
            color={colors.textMuted}
          />
          <Text style={[s.notFoundTitle, { color: colors.text }]}>
            Task not found
          </Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[s.backLink, { color: "#3b82f6" }]}>
              ← Back to board
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar barStyle={colors.isDark ? "light-content" : "dark-content"} />

      {/* Nav Header */}
      <View
        style={[
          s.navHeader,
          { borderBottomColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={20}
            color={colors.text}
          />
        </TouchableOpacity>
        <Text style={[s.navTitle, { color: colors.text }]} numberOfLines={1}>
          Task Details
        </Text>
        <Text style={[s.taskId, { color: colors.textMuted }]}>#{todo.id}</Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Badges */}
        <View style={s.badgeRow}>
          {pc && (
            <View
              style={[
                s.badge,
                {
                  backgroundColor: colors.isDark ? pc.bgColorDark : pc.bgColor,
                  borderColor: pc.borderColor,
                },
              ]}
            >
              <Text style={[s.badgeText, { color: pc.color }]}>
                {pc.label} Priority
              </Text>
            </View>
          )}
          {sc && (
            <View
              style={[
                s.badge,
                {
                  backgroundColor: colors.isDark ? sc.bgColorDark : sc.bgColor,
                },
              ]}
            >
              <View style={[s.badgeDot, { backgroundColor: sc.dotColor }]} />
              <Text style={[s.badgeText, { color: sc.color }]}>{sc.label}</Text>
            </View>
          )}
          {overdue && (
            <View
              style={[
                s.badge,
                {
                  backgroundColor: colors.isDark
                    ? "rgba(220,38,38,0.15)"
                    : "#fef2f2",
                  borderColor: "#fecaca",
                },
              ]}
            >
              <MaterialCommunityIcons
                name="alert-circle"
                size={11}
                color="#dc2626"
              />
              <Text style={[s.badgeText, { color: "#dc2626" }]}>Overdue</Text>
            </View>
          )}
        </View>

        {/* Title */}
        <Text
          style={[
            s.title,
            { color: colors.text },
            todo.status === "COMPLETED" && {
              textDecorationLine: "line-through",
              opacity: 0.5,
            },
          ]}
        >
          {todo.title}
        </Text>

        {/* Meta */}
        <View style={s.metaRow}>
          <View style={[s.metaDot, { backgroundColor: sc?.dotColor }]} />
          <Text style={[s.metaText, { color: colors.textSecondary }]}>
            {sc?.label}
          </Text>
          <Text style={[s.metaSep, { color: colors.border }]}>·</Text>
          <Text style={[s.metaText, { color: colors.textMuted }]}>
            Updated{" "}
            {new Date(todo.updatedAt).toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Description */}
        {todo.description && (
          <View style={s.section}>
            <SectionLabel icon="text" label="Description" colors={colors} />
            <View
              style={[
                s.infoCard,
                {
                  backgroundColor: colors.isDark
                    ? colors.surfaceElevated
                    : "#f8fafc",
                  borderColor: colors.border,
                },
              ]}
            >
              <Text style={[s.bodyText, { color: colors.textSecondary }]}>
                {todo.description}
              </Text>
            </View>
          </View>
        )}

        {/* Notes */}
        {todo.notes && (
          <View style={s.section}>
            <SectionLabel
              icon="note-text-outline"
              label="Notes"
              colors={colors}
            />
            <View
              style={[
                s.notesCard,
                {
                  borderColor: colors.isDark
                    ? "rgba(251,191,36,0.3)"
                    : "#fde68a",
                  backgroundColor: colors.isDark
                    ? "rgba(251,191,36,0.07)"
                    : "#fffbeb",
                },
              ]}
            >
              <View style={s.notesAccent} />
              <Text
                style={[
                  s.bodyText,
                  { color: colors.textSecondary, paddingLeft: 8 },
                ]}
              >
                {todo.notes}
              </Text>
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={s.section}>
          <SectionLabel
            icon="calendar-range"
            label="Timeline"
            colors={colors}
          />
          <View style={s.timelineRow}>
            <View
              style={[
                s.timelineCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  s.timelineIcon,
                  { backgroundColor: "#eff6ff", borderColor: "#bfdbfe" },
                ]}
              >
                <MaterialCommunityIcons
                  name="calendar-start"
                  size={14}
                  color="#3b82f6"
                />
              </View>
              <View>
                <Text style={[s.timelineMeta, { color: colors.textMuted }]}>
                  START
                </Text>
                <Text
                  style={[s.timelineDate, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {startDate ?? "Not set"}
                </Text>
                {startTime && (
                  <Text
                    style={[s.timelineTime, { color: colors.textSecondary }]}
                  >
                    {startTime}
                  </Text>
                )}
              </View>
            </View>

            <View
              style={[
                s.timelineCard,
                {
                  backgroundColor: overdue
                    ? colors.isDark
                      ? "rgba(220,38,38,0.07)"
                      : "#fef2f2"
                    : colors.surfaceElevated,
                  borderColor: overdue
                    ? colors.isDark
                      ? "rgba(220,38,38,0.3)"
                      : "#fecaca"
                    : colors.border,
                },
              ]}
            >
              <View
                style={[
                  s.timelineIcon,
                  {
                    backgroundColor: overdue ? "#fef2f2" : "#f0fdf4",
                    borderColor: overdue ? "#fecaca" : "#bbf7d0",
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={overdue ? "alert-circle" : "calendar-end"}
                  size={14}
                  color={overdue ? "#dc2626" : "#22c55e"}
                />
              </View>
              <View>
                <Text style={[s.timelineMeta, { color: colors.textMuted }]}>
                  DUE
                </Text>
                <Text
                  style={[
                    s.timelineDate,
                    { color: overdue ? "#dc2626" : colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {endDate ?? "Not set"}
                </Text>
                {endTime && (
                  <Text
                    style={[s.timelineTime, { color: colors.textSecondary }]}
                  >
                    {endTime}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Tags */}
        {todo.tags?.length > 0 && (
          <View style={s.section}>
            <SectionLabel
              icon="tag-multiple-outline"
              label="Tags"
              colors={colors}
            />
            <View style={s.tagsWrap}>
              {todo.tags.map((tag) => (
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
                  <MaterialCommunityIcons
                    name="tag-outline"
                    size={11}
                    color={colors.textMuted}
                  />
                  <Text style={[s.tagText, { color: colors.textSecondary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Ref Link */}
        {todo.refLink && (
          <View style={s.section}>
            <SectionLabel
              icon="link-variant"
              label="Reference Link"
              colors={colors}
            />
            <TouchableOpacity
              onPress={() =>
                Linking.openURL(
                  todo.refLink!.startsWith("http")
                    ? todo.refLink!
                    : `https://${todo.refLink}`,
                )
              }
              style={[
                s.linkCard,
                {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  s.linkIcon,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons name="link" size={14} color="#6366f1" />
              </View>
              <Text style={s.linkText} numberOfLines={1}>
                {todo.refLink}
              </Text>
              <MaterialCommunityIcons
                name="open-in-new"
                size={14}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Meta info */}
        <View style={s.section}>
          <View style={s.metaInfoRow}>
            {[
              { label: "Task ID", value: `#${todo.id}` },
              {
                label: "Created",
                value: new Date(todo.createdAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              },
              {
                label: "Updated",
                value: new Date(todo.updatedAt).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              },
            ].map((item) => (
              <View
                key={item.label}
                style={[
                  s.metaInfoCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[s.metaInfoLabel, { color: colors.textMuted }]}>
                  {item.label}
                </Text>
                <Text style={[s.metaInfoValue, { color: colors.text }]}>
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Bottom actions */}
      <View
        style={[
          s.footer,
          { borderTopColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        <TouchableOpacity
          onPress={handleEdit}
          style={[
            s.editBtn,
            {
              borderColor: colors.border,
              backgroundColor: colors.surfaceElevated,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="pencil-outline"
            size={16}
            color={colors.text}
          />
          <Text style={[s.editBtnText, { color: colors.text }]}>Edit Task</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleDelete}
          style={[
            s.deleteBtn,
            {
              borderColor: colors.dangerBorder,
              backgroundColor: colors.dangerBg,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="trash-can-outline"
            size={16}
            color={colors.danger}
          />
          <Text style={[s.deleteBtnText, { color: colors.danger }]}>
            Delete
          </Text>
        </TouchableOpacity>
      </View>

      <TodoFormModal
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSubmit}
        initial={editingTodo}
        defaultStatus={editingTodo?.status ?? "PENDING"}
      />
    </SafeAreaView>
  );
}

const styles = (
  colors: ReturnType<typeof import("../hooks/useColor").useColors>,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    loadingCenter: { flex: 1, alignItems: "center", justifyContent: "center" },
    notFound: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    notFoundTitle: { fontSize: 16, fontWeight: "600" },
    backLink: { fontSize: 14, fontWeight: "600" },

    navHeader: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      gap: 12,
    },
    backBtn: { padding: 4 },
    navTitle: { flex: 1, fontSize: 16, fontWeight: "700" },
    taskId: { fontSize: 11, fontFamily: "monospace" },

    scroll: { flex: 1 },
    scrollContent: { padding: 20 },

    badgeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 7,
      marginBottom: 14,
    },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    badgeDot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { fontSize: 11, fontWeight: "700" },

    title: {
      fontSize: 26,
      fontWeight: "800",
      lineHeight: 34,
      letterSpacing: -0.5,
      marginBottom: 10,
    },

    metaRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginBottom: 24,
    },
    metaDot: { width: 6, height: 6, borderRadius: 3 },
    metaText: { fontSize: 12 },
    metaSep: { fontSize: 16 },

    section: { marginBottom: 24 },

    infoCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
    },
    bodyText: { fontSize: 14, lineHeight: 22 },

    notesCard: {
      borderRadius: 12,
      borderWidth: 1,
      padding: 14,
      flexDirection: "row",
      position: "relative",
    },
    notesAccent: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 3,
      borderRadius: 12,
      backgroundColor: "#fbbf24",
    },

    timelineRow: { flexDirection: "row", gap: 10 },
    timelineCard: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
      flexDirection: "row",
      alignItems: "flex-start",
      gap: 10,
    },
    timelineIcon: {
      width: 32,
      height: 32,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
      marginTop: 2,
    },
    timelineMeta: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 1,
      marginBottom: 2,
    },
    timelineDate: { fontSize: 12, fontWeight: "600", lineHeight: 16 },
    timelineTime: { fontSize: 11, marginTop: 3 },

    tagsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
    tagChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
    },
    tagText: { fontSize: 12, fontWeight: "500" },

    linkCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      borderRadius: 12,
      borderWidth: 1,
      padding: 12,
    },
    linkIcon: {
      width: 30,
      height: 30,
      borderRadius: 8,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    linkText: {
      flex: 1,
      fontSize: 13,
      color: "#6366f1",
      textDecorationLine: "underline",
    },

    metaInfoRow: { flexDirection: "row", gap: 8 },
    metaInfoCard: {
      flex: 1,
      borderRadius: 10,
      borderWidth: 1,
      padding: 12,
    },
    metaInfoLabel: {
      fontSize: 9,
      fontWeight: "700",
      letterSpacing: 0.8,
      marginBottom: 4,
      textTransform: "uppercase",
    },
    metaInfoValue: { fontSize: 12, fontWeight: "600" },

    footer: {
      flexDirection: "row",
      gap: 10,
      padding: 16,
      borderTopWidth: 1,
    },
    editBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      padding: 13,
      borderRadius: 12,
      borderWidth: 1,
    },
    editBtnText: { fontSize: 14, fontWeight: "600" },
    deleteBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 7,
      padding: 13,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 20,
    },
    deleteBtnText: { fontSize: 14, fontWeight: "600" },
  });
