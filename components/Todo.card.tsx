import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Menu } from "react-native-paper";
import type { Todo } from "../types";
import { PRIORITY_CONFIG, STATUS_CONFIG } from "../constants";
import { useColors } from "@/hooks/useColor";

interface TodoCardProps {
  todo: Todo;
  onEdit: (todo: Todo) => void;
  onDelete: (id: number) => void;
  onPress: (todo: Todo) => void;
  onStatusChange?: (id: number, status: Todo["status"]) => void;
}

function formatDate(d?: string) {
  if (!d) return null;
  const [y, m, day] = d.split("-");
  return new Date(Number(y), Number(m) - 1, Number(day)).toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function isOverdue(endDate?: string, status?: string) {
  if (!endDate || status === "COMPLETED" || status === "CANCELLED")
    return false;
  return new Date(endDate) < new Date();
}

export default function TodoCard({
  todo,
  onEdit,
  onDelete,
  onPress,
}: TodoCardProps) {
  const colors = useColors();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const pc = PRIORITY_CONFIG[todo.priority];
  const sc = STATUS_CONFIG[todo.status];
  const overdue = isOverdue(todo.endDate, todo.status);
  const dueDate = formatDate(todo.endDate);

  const handleDelete = () => {
    setMenuVisible(false);
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${todo.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(todo.id),
        },
      ],
    );
  };

  const s = styles(colors);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => onPress(todo)}
      style={s.card}
    >
      {/* Priority accent bar */}
      <View style={[s.accentBar, { backgroundColor: pc.color }]} />

      <View style={s.content}>
        {/* Top row: status badge + priority badge + menu */}
        <View style={s.topRow}>
          <View
            style={[
              s.badge,
              { backgroundColor: colors.isDark ? sc.bgColorDark : sc.bgColor },
            ]}
          >
            <View style={[s.dot, { backgroundColor: sc.dotColor }]} />
            <Text style={[s.badgeText, { color: sc.color }]}>{sc.label}</Text>
          </View>

          <View
            style={[
              s.badge,
              {
                backgroundColor: colors.isDark ? pc.bgColorDark : pc.bgColor,
                marginLeft: 6,
              },
            ]}
          >
            <Text style={[s.badgeText, { color: pc.color }]}>{pc.label}</Text>
          </View>

          <View style={{ flex: 1 }} />

          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={{ backgroundColor: colors.surface, borderRadius: 12 }}
            anchor={
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={s.menuBtn}
              >
                <MaterialCommunityIcons
                  name="dots-horizontal"
                  size={18}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onPress(todo);
              }}
              title="View Details"
              leadingIcon="eye-outline"
              titleStyle={{ color: colors.text }}
            />
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                onEdit(todo);
              }}
              title="Edit"
              leadingIcon="pencil-outline"
              titleStyle={{ color: colors.text }}
            />
            <Menu.Item
              onPress={handleDelete}
              title="Delete"
              leadingIcon="trash-can-outline"
              titleStyle={{ color: colors.danger }}
            />
          </Menu>
        </View>

        {/* Title */}
        <Text
          style={[
            s.title,
            { color: colors.text },
            todo.status === "COMPLETED" && s.titleStrike,
          ]}
          numberOfLines={2}
        >
          {todo.title}
        </Text>

        {/* Description */}
        {todo.description ? (
          <Text
            style={[s.desc, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {todo.description}
          </Text>
        ) : null}

        {/* Tags */}
        {todo.tags?.length > 0 && (
          <View style={s.tagsRow}>
            <MaterialCommunityIcons
              name="tag-outline"
              size={11}
              color={colors.textMuted}
            />
            {todo.tags.slice(0, 3).map((tag) => (
              <View
                key={tag}
                style={[
                  s.tag,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[s.tagText, { color: colors.textSecondary }]}>
                  {tag}
                </Text>
              </View>
            ))}
            {todo.tags.length > 3 && (
              <Text style={[s.moreTag, { color: colors.textMuted }]}>
                +{todo.tags.length - 3}
              </Text>
            )}
          </View>
        )}

        {/* Due date */}
        {dueDate && (
          <View
            style={[
              s.dateRow,
              overdue && {
                backgroundColor: colors.dangerBg,
                borderTopColor: colors.dangerBorder,
              },
            ]}
          >
            <MaterialCommunityIcons
              name={overdue ? "alert-circle-outline" : "calendar-outline"}
              size={12}
              color={overdue ? colors.danger : colors.textMuted}
            />
            <Text
              style={[
                s.dateText,
                { color: overdue ? colors.danger : colors.textSecondary },
              ]}
            >
              {overdue ? "Overdue · " : "Due "}
              {dueDate}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = (
  colors: ReturnType<typeof import("../hooks/useColor").useColors>,
) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 14,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOpacity: colors.isDark ? 0.3 : 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    accentBar: {
      position: "absolute",
      left: 0,
      top: 10,
      bottom: 10,
      width: 3,
      borderRadius: 2,
    },
    content: {
      paddingLeft: 16,
      paddingRight: 12,
      paddingTop: 12,
      paddingBottom: 0,
    },

    topRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
    badge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 6,
    },
    dot: { width: 6, height: 6, borderRadius: 3 },
    badgeText: { fontSize: 10, fontWeight: "700" },
    menuBtn: { padding: 4 },

    title: { fontSize: 14, fontWeight: "600", lineHeight: 20, marginBottom: 4 },
    titleStrike: { textDecorationLine: "line-through", opacity: 0.5 },
    desc: { fontSize: 12, lineHeight: 18, marginBottom: 8 },

    tagsRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      marginBottom: 8,
      flexWrap: "wrap",
    },
    tag: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
    },
    tagText: { fontSize: 10, fontWeight: "500" },
    moreTag: { fontSize: 10 },

    dateRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 8,
      marginTop: 4,
      borderTopWidth: 1,
      borderTopColor: "transparent",
      marginHorizontal: -12,
      paddingHorizontal: 12,
    },
    dateText: { fontSize: 11, fontWeight: "500" },
  });
