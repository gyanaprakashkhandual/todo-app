/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FAB, Menu } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { useAppDispatch, useAppSelector } from "../lib/store";
import {
  fetchTodos,
  fetchStats,
  fetchTags,
  createTodo,
  updateTodo,
  deleteTodo,
  patchTodoStatus,
  setFilter,
  optimisticStatusUpdate,
} from "../lib/todo.slice";
import { useAuth } from "../context/Auth.context";
import { useColors } from "../hooks/useColor";
import { useTheme } from "../context/Theme.context";
import { COLUMN_CONFIG, PRIORITY_CONFIG } from "../constants";
import TodoCard from "@/components/Todo.card";
import TodoFormModal from "@/components/Todo.modal";
import StatPill from "@/components/Stat.pill";
import type {
  Todo,
  TodoRequest,
  TodoStatus,
  Priority,
  RootStackParamList,
} from "../types";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const PRIORITIES: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const colors = useColors();
  const { isDark, toggleTheme } = useTheme();

  const { todos, stats, filter, loading, statsLoading } = useAppSelector(
    (s) => s.todos,
  );

  const [activeTab, setActiveTab] = useState<TodoStatus | "ALL">("ALL");
  const [formVisible, setFormVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TodoStatus>("PENDING");
  const [searchText, setSearchText] = useState("");
  const [profileMenuVisible, setProfileMenuVisible] = useState(false);
  const [priorityMenuVisible, setPriorityMenuVisible] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = useCallback(() => {
    dispatch(fetchTodos({ ...filter, size: 100 }));
    dispatch(fetchStats());
    dispatch(fetchTags());
  }, [dispatch, filter]);

  const handleSearch = (text: string) => {
    setSearchText(text);
    dispatch(setFilter({ search: text || undefined }));
  };

  const handlePriorityFilter = (p: Priority | undefined) => {
    setPriorityMenuVisible(false);
    dispatch(setFilter({ priority: p }));
  };

  const openCreate = (status: TodoStatus = "PENDING") => {
    setEditingTodo(null);
    setDefaultStatus(status);
    setFormVisible(true);
  };

  const openEdit = (todo: Todo) => {
    setEditingTodo(todo);
    setDefaultStatus(todo.status);
    setFormVisible(true);
  };

  const handleSubmit = async (req: TodoRequest) => {
    if (editingTodo) {
      await dispatch(updateTodo({ id: editingTodo.id, req })).unwrap();
    } else {
      await dispatch(createTodo(req)).unwrap();
    }
    dispatch(fetchStats());
    dispatch(fetchTags());
  };

  const handleDelete = async (id: number) => {
    await dispatch(deleteTodo(id)).unwrap();
    dispatch(fetchStats());
  };

  const handleStatusChange = async (id: number, status: TodoStatus) => {
    const todo = todos.find((t) => t.id === id);
    if (!todo || todo.status === status) return;
    dispatch(optimisticStatusUpdate({ id, status }));
    try {
      await dispatch(patchTodoStatus({ id, status })).unwrap();
      dispatch(fetchStats());
    } catch {
      dispatch(optimisticStatusUpdate({ id, status: todo.status }));
    }
  };

  const filteredTodos =
    activeTab === "ALL" ? todos : todos.filter((t) => t.status === activeTab);

  const s = styles(colors);
  const initials = (user?.name || user?.email || "U").charAt(0).toUpperCase();

  const statItems = [
    {
      label: "Total",
      value: stats?.total ?? 0,
      dotColor: "#94a3b8",
      textColor: colors.textSecondary,
    },
    {
      label: "Pending",
      value: stats?.pending ?? 0,
      dotColor: "#fbbf24",
      textColor: "#d97706",
    },
    {
      label: "Active",
      value: stats?.inProgress ?? 0,
      dotColor: "#3b82f6",
      textColor: "#1d4ed8",
    },
    {
      label: "Done",
      value: stats?.completed ?? 0,
      dotColor: "#22c55e",
      textColor: "#15803d",
    },
  ];

  return (
    <SafeAreaView style={s.container} edges={["top"]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

      {/* Header */}
      <View style={s.header}>
        <View style={s.headerLeft}>
          <View style={s.logoBox}>
            <MaterialCommunityIcons
              name="check-bold"
              size={14}
              color={colors.primaryFg}
            />
          </View>
          <Text style={s.logoText}>TODO</Text>
        </View>

        <View style={s.headerRight}>
          {/* Theme toggle */}
          <TouchableOpacity onPress={toggleTheme} style={s.iconBtn}>
            <MaterialCommunityIcons
              name={isDark ? "weather-sunny" : "weather-night"}
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Profile menu */}
          <Menu
            visible={profileMenuVisible}
            onDismiss={() => setProfileMenuVisible(false)}
            contentStyle={{ backgroundColor: colors.surface, borderRadius: 14 }}
            anchor={
              <TouchableOpacity
                onPress={() => setProfileMenuVisible(true)}
                style={[
                  s.avatar,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[s.avatarText, { color: colors.text }]}>
                  {initials}
                </Text>
              </TouchableOpacity>
            }
          >
            <View
              style={[s.profileHeader, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  s.avatar,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[s.avatarText, { color: colors.text }]}>
                  {initials}
                </Text>
              </View>
              <View style={{ marginLeft: 10 }}>
                <Text style={[s.profileName, { color: colors.text }]}>
                  {user?.name || "–"}
                </Text>
                <Text style={[s.profileEmail, { color: colors.textMuted }]}>
                  {user?.email || "–"}
                </Text>
              </View>
            </View>
            <Menu.Item
              onPress={() => {
                setProfileMenuVisible(false);
                logout();
              }}
              title="Sign out"
              leadingIcon="logout"
              titleStyle={{ color: colors.danger }}
            />
          </Menu>
        </View>
      </View>

      {/* Stat pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.statsRow}
        style={s.statsScroll}
      >
        {statItems.map((item) => (
          <StatPill key={item.label} {...item} loading={statsLoading} />
        ))}
      </ScrollView>

      {/* Search + Filter */}
      <View style={s.searchRow}>
        <View
          style={[
            s.searchBox,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
          ]}
        >
          <MaterialCommunityIcons
            name="magnify"
            size={18}
            color={colors.textMuted}
          />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search tasks..."
            placeholderTextColor={colors.textMuted}
            value={searchText}
            onChangeText={handleSearch}
          />
          {searchText ? (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <MaterialCommunityIcons
                name="close-circle"
                size={16}
                color={colors.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Priority filter */}
        <Menu
          visible={priorityMenuVisible}
          onDismiss={() => setPriorityMenuVisible(false)}
          contentStyle={{ backgroundColor: colors.surface, borderRadius: 14 }}
          anchor={
            <TouchableOpacity
              onPress={() => setPriorityMenuVisible(true)}
              style={[
                s.filterBtn,
                {
                  borderColor: filter.priority
                    ? PRIORITY_CONFIG[filter.priority].color
                    : colors.border,
                  backgroundColor: colors.surfaceElevated,
                },
              ]}
            >
              <MaterialCommunityIcons
                name="tune-variant"
                size={16}
                color={
                  filter.priority
                    ? PRIORITY_CONFIG[filter.priority].color
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  s.filterBtnText,
                  {
                    color: filter.priority
                      ? PRIORITY_CONFIG[filter.priority].color
                      : colors.textSecondary,
                  },
                ]}
              >
                {filter.priority
                  ? PRIORITY_CONFIG[filter.priority].label
                  : "Priority"}
              </Text>
            </TouchableOpacity>
          }
        >
          <Menu.Item
            onPress={() => handlePriorityFilter(undefined)}
            title="All priorities"
            titleStyle={{ color: colors.text }}
          />
          {PRIORITIES.map((p) => (
            <Menu.Item
              key={p}
              onPress={() => handlePriorityFilter(p)}
              title={PRIORITY_CONFIG[p].label}
              titleStyle={{
                color: PRIORITY_CONFIG[p].color,
                fontWeight: filter.priority === p ? "700" : "400",
              }}
            />
          ))}
        </Menu>
      </View>

      {/* Tab bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabsRow}
        style={s.tabsScroll}
      >
        <TouchableOpacity
          onPress={() => setActiveTab("ALL")}
          style={[
            s.tab,
            activeTab === "ALL" && [
              s.tabActive,
              { backgroundColor: colors.primary },
            ],
          ]}
        >
          <Text
            style={[
              s.tabText,
              {
                color:
                  activeTab === "ALL" ? colors.primaryFg : colors.textSecondary,
              },
            ]}
          >
            All ({todos.length})
          </Text>
        </TouchableOpacity>
        {COLUMN_CONFIG.map((col) => {
          const count = todos.filter((t) => t.status === col.id).length;
          const active = activeTab === col.id;
          return (
            <TouchableOpacity
              key={col.id}
              onPress={() => setActiveTab(col.id)}
              style={[
                s.tab,
                active && {
                  backgroundColor: col.color + "20",
                  borderColor: col.color,
                },
              ]}
            >
              <View style={[s.tabDot, { backgroundColor: col.color }]} />
              <Text
                style={[
                  s.tabText,
                  {
                    color: active ? col.color : colors.textSecondary,
                    fontWeight: active ? "700" : "500",
                  },
                ]}
              >
                {col.title} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Todo List */}
      {loading && todos.length === 0 ? (
        <View style={s.loadingCenter}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[s.loadingText, { color: colors.textSecondary }]}>
            Loading tasks...
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTodos}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={s.listContent}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={loadData}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <TodoCard
              todo={item}
              onEdit={openEdit}
              onDelete={handleDelete}
              onPress={(todo) =>
                navigation.navigate("TodoDetail", { todoId: todo.id })
              }
              onStatusChange={handleStatusChange}
            />
          )}
          ListEmptyComponent={
            <View style={s.emptyState}>
              <View
                style={[
                  s.emptyIcon,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="inbox-outline"
                  size={32}
                  color={colors.textMuted}
                />
              </View>
              <Text style={[s.emptyTitle, { color: colors.text }]}>
                {searchText ? "No results found" : "No tasks yet"}
              </Text>
              <Text style={[s.emptyDesc, { color: colors.textSecondary }]}>
                {searchText
                  ? `No tasks matching "${searchText}"`
                  : "Tap + to create your first task"}
              </Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <FAB
        icon="plus"
        style={[s.fab, { backgroundColor: colors.primary }]}
        color={colors.primaryFg}
        onPress={() =>
          openCreate(
            activeTab === "ALL" ? "PENDING" : (activeTab as TodoStatus),
          )
        }
        label="New Task"
      />

      {/* Form Modal */}
      <TodoFormModal
        visible={formVisible}
        onClose={() => {
          setFormVisible(false);
          setEditingTodo(null);
        }}
        onSubmit={handleSubmit}
        initial={editingTodo}
        defaultStatus={defaultStatus}
      />
    </SafeAreaView>
  );
}

const styles = (
  colors: ReturnType<typeof import("../hooks/useColor").useColors>,
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    // Header
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    logoBox: {
      width: 28,
      height: 28,
      borderRadius: 7,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    logoText: {
      fontSize: 14,
      fontWeight: "800",
      letterSpacing: 3,
      color: colors.text,
    },
    headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
    iconBtn: {
      width: 34,
      height: 34,
      borderRadius: 9,
      backgroundColor: colors.surfaceElevated,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    avatarText: { fontSize: 13, fontWeight: "700" },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderBottomWidth: 1,
      marginBottom: 4,
    },
    profileName: { fontSize: 13, fontWeight: "700" },
    profileEmail: { fontSize: 11 },

    // Stats
    statsScroll: { maxHeight: 48 },
    statsRow: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      gap: 8,
      flexDirection: "row",
    },

    // Search
    searchRow: {
      flexDirection: "row",
      paddingHorizontal: 16,
      paddingVertical: 10,
      gap: 8,
    },
    searchBox: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 10,
      height: 38,
    },
    searchInput: { flex: 1, fontSize: 14, height: 38 },
    filterBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      height: 38,
      borderRadius: 10,
      borderWidth: 1,
    },
    filterBtnText: { fontSize: 12, fontWeight: "600" },

    // Tabs
    tabsScroll: { maxHeight: 44 },
    tabsRow: {
      paddingHorizontal: 16,
      paddingVertical: 6,
      gap: 6,
      flexDirection: "row",
      alignItems: "center",
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: "transparent",
    },
    tabActive: {},
    tabDot: { width: 6, height: 6, borderRadius: 3 },
    tabText: { fontSize: 12, fontWeight: "500" },

    // List
    listContent: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 100 },

    // Loading
    loadingCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
    },
    loadingText: { fontSize: 14 },

    // Empty
    emptyState: { alignItems: "center", paddingTop: 60, paddingBottom: 40 },
    emptyIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    emptyTitle: { fontSize: 16, fontWeight: "600", marginBottom: 6 },
    emptyDesc: { fontSize: 13, textAlign: "center" },

    // FAB
    fab: {
      position: "absolute",
      bottom: 24,
      right: 20,
      borderRadius: 16,
    },
  });
