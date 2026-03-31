import {
  Badge,
  Box,
  HStack,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { FC } from "react";
import { LastConnection, UserConnection } from "types/User";
import { useUserConnections } from "hooks/useUserConnections";
import { useTheme } from "contexts/ThemeContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/tr";

dayjs.extend(relativeTime);
dayjs.locale("tr");

/* ── Device brand → icon mapping ───────────────────────── */
function deviceIcon(brand: string): string {
  const b = brand.toLowerCase();
  if (b === "apple") return "🍎";
  if (b === "samsung") return "📱";
  if (b === "xiaomi" || b === "redmi") return "📱";
  if (b === "huawei") return "📱";
  if (b === "google" || b === "pixel") return "🤖";
  if (b === "windows") return "🖥️";
  if (b === "linux") return "🐧";
  return "📡";
}

function osColor(os: string): string {
  const o = os.toLowerCase();
  if (o === "ios" || o === "ipados" || o === "macos") return "#a8c4ff";
  if (o === "android") return "#aaffaa";
  if (o === "windows") return "#aad4ff";
  return "#e0e0e0";
}

/* ── Compact chip for the table row ───────────────────── */
interface DeviceChipProps {
  conn: LastConnection;
}

export const DeviceChip: FC<DeviceChipProps> = ({ conn }) => {
  const label = `${conn.device_brand} ${conn.device_model} • ${conn.client_name} ${conn.client_version}\nIP: ${conn.ip} • ${conn.flag} ${conn.city}, ${conn.country}`;

  return (
    <Tooltip label={label} placement="top" hasArrow fontSize="xs" whiteSpace="pre">
      <HStack
        spacing={1}
        display="inline-flex"
        px={1.5}
        py={0.5}
        borderRadius="6px"
        bg="rgba(var(--px-accent-rgb),0.1)"
        border="1px solid rgba(var(--px-accent-rgb),0.2)"
        cursor="default"
        userSelect="none"
        maxW="220px"
        overflow="hidden"
        flexShrink={0}
      >
        <Text fontSize="10px" lineHeight="1">{deviceIcon(conn.device_brand)}</Text>
        <Text
          fontSize="10px"
          color="var(--px-text-muted)"
          lineHeight="1"
          isTruncated
          maxW="80px"
        >
          {conn.device_model}
        </Text>
        <Text fontSize="10px" lineHeight="1">{conn.flag}</Text>
        <Text
          fontSize="10px"
          color="var(--px-text-muted)"
          lineHeight="1"
          isTruncated
          maxW="60px"
        >
          {conn.city}
        </Text>
      </HStack>
    </Tooltip>
  );
};

/* ── Connection row for modal panel ───────────────────── */
interface ConnectionRowProps {
  conn: UserConnection;
  accentRgb: string;
}

const ConnectionRow: FC<ConnectionRowProps> = ({ conn, accentRgb }) => {
  const timeAgo = dayjs(conn.connected_at).fromNow();
  const osc = osColor(conn.device_os);

  return (
    <Box
      px={3}
      py={2.5}
      borderRadius="10px"
      bg={conn.is_current ? `rgba(${accentRgb},0.1)` : "rgba(255,255,255,0.04)"}
      border={`1px solid rgba(${accentRgb},${conn.is_current ? "0.3" : "0.1"})`}
      position="relative"
      overflow="hidden"
    >
      {conn.is_current && (
        <Badge
          position="absolute"
          top="6px"
          right="8px"
          fontSize="9px"
          colorScheme="green"
          variant="subtle"
          px={1.5}
          py={0.5}
          borderRadius="4px"
        >
          AKTİF
        </Badge>
      )}

      <HStack spacing={3} align="flex-start">
        {/* Device icon */}
        <Box
          w="36px"
          h="36px"
          borderRadius="8px"
          bg={`rgba(${accentRgb},0.12)`}
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="18px"
          flexShrink={0}
        >
          {deviceIcon(conn.device_brand)}
        </Box>

        <VStack spacing={0.5} align="flex-start" flex={1} minW={0}>
          {/* Device name + OS */}
          <HStack spacing={1.5} flexWrap="wrap">
            <Text fontSize="13px" fontWeight="semibold" color="white" lineHeight="1.2">
              {conn.device_brand} {conn.device_model}
            </Text>
            <Badge
              fontSize="9px"
              px={1.5}
              py={0.5}
              borderRadius="4px"
              bg={`${osc}20`}
              color={osc}
              border={`1px solid ${osc}40`}
            >
              {conn.device_os} {conn.device_os_version}
            </Badge>
          </HStack>

          {/* Client + location row */}
          <HStack spacing={2} flexWrap="wrap">
            <Text fontSize="11px" color="var(--px-text-muted)">
              📡 {conn.client_name} {conn.client_version}
            </Text>
            <Text fontSize="11px" color="var(--px-text-faint)">•</Text>
            <Text fontSize="11px" color="var(--px-text-muted)">
              {conn.flag} {conn.city}, {conn.country}
            </Text>
          </HStack>

          {/* IP + time */}
          <HStack spacing={2}>
            <Text fontSize="10px" color="var(--px-text-faint)" fontFamily="mono">
              {conn.ip}
            </Text>
            <Text fontSize="10px" color="var(--px-text-faint)">•</Text>
            <Text fontSize="10px" color="var(--px-text-faint)">
              {timeAgo}
            </Text>
          </HStack>
        </VStack>
      </HStack>
    </Box>
  );
};

/* ── Full connections panel for modal ─────────────────── */
interface ConnectionsPanelProps {
  username: string;
}

export const ConnectionsPanel: FC<ConnectionsPanelProps> = ({ username }) => {
  const { currentTheme } = useTheme();
  const { data: connections, isLoading, isError } = useUserConnections(username);

  if (isLoading) {
    return (
      <HStack justify="center" py={4}>
        <Spinner size="sm" color={currentTheme.accent} />
        <Text fontSize="sm" color="var(--px-text-muted)">
          Bağlantılar yükleniyor...
        </Text>
      </HStack>
    );
  }

  if (isError || !connections) {
    return null;
  }

  if (connections.length === 0) {
    return (
      <Box
        px={3}
        py={3}
        borderRadius="10px"
        bg="rgba(255,255,255,0.03)"
        border="1px solid rgba(255,255,255,0.08)"
        textAlign="center"
      >
        <Text fontSize="12px" color="var(--px-text-faint)">
          Kayıtlı bağlantı bulunmuyor
        </Text>
      </Box>
    );
  }

  return (
    <VStack spacing={2} align="stretch">
      {connections.map((conn) => (
        <ConnectionRow
          key={conn.id}
          conn={conn}
          accentRgb={currentTheme.accentRgb}
        />
      ))}
    </VStack>
  );
};
