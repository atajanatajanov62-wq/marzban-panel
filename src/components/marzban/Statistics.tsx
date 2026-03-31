import { keyframes } from "@emotion/react";
import {
  Box,
  BoxProps,
  HStack,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import {
  BoltIcon,
  ChartBarIcon,
  ChartPieIcon,
  CpuChipIcon,
  SignalIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";
import { useDashboard } from "contexts/DashboardContext";
import { FC, ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "react-query";
import { fetch } from "service/http";
import { formatBytes, numberWithCommas } from "utils/formatByte";

export const StatisticsQueryKey = "statistics-query-key";

const MotionBox = motion(Box as any);

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%       { opacity: 0.5; transform: scale(1.2); }
`;

function useCountUp(target: number, duration = 1000) {
  const [val, setVal] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    if (!target || isNaN(target)) { setVal(target || 0); return; }
    const start = prev.current;
    const diff = target - start;
    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setVal(current);
      if (progress < 1) requestAnimationFrame(tick);
      else prev.current = target;
    };
    requestAnimationFrame(tick);
  }, [target, duration]);
  return val;
}

type CardProps = {
  title: string;
  mainValue: string | null;
  subValue?: string;
  numericTarget?: number;
  unit?: string;
  icon: React.ElementType;
  accent: string;
  delay?: number;
  doPulse?: boolean;
};

const StatCard: FC<CardProps> = ({
  title, mainValue, subValue, numericTarget, unit = "",
  icon: Icon, accent, delay = 0, doPulse = false,
}) => {
  const counted = useCountUp(numericTarget ?? 0);
  const displayMain =
    numericTarget != null
      ? `${numberWithCommas(counted)}${unit}`
      : mainValue;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      bg="var(--px-card-bg, rgba(15,25,60,0.55))"
      border="1px solid var(--px-card-border, rgba(59,130,246,0.18))"
      borderRadius="16px"
      p={4}
      position="relative"
      overflow="hidden"
      role="group"
      sx={{
        backdropFilter: "blur(14px)",
        boxShadow: "var(--px-card-shadow, 0 4px 24px rgba(0,0,0,0.06))",
        transition: "background 0.2s, border-color 0.2s, box-shadow 0.3s",
        "&:hover": {
          borderColor: `${accent}77`,
          boxShadow: `0 8px 32px ${accent}22, 0 0 0 1px ${accent}33`,
        },
        "&::after": {
          content: `""`,
          position: "absolute",
          top: 0, left: 0,
          width: "100%", height: "2px",
          background: `linear-gradient(90deg, ${accent}cc, transparent)`,
          borderRadius: "16px 16px 0 0",
        },
      }}
    >
      {/* Background glow */}
      <Box
        position="absolute" top="-20px" right="-20px"
        w="80px" h="80px" bg={`${accent}0f`}
        borderRadius="full" pointerEvents="none"
      />

      <HStack justifyContent="space-between" alignItems="flex-start">
        <Box flex={1} minW={0}>
          <Text
            fontSize="10px" color="var(--px-text-muted)"
            fontWeight="semibold" textTransform="uppercase"
            letterSpacing="0.08em" mb={1.5}
          >
            {title}
          </Text>
          <HStack alignItems="flex-end" gap={1.5} flexWrap="wrap">
            <Text
              fontSize={{ base: "20px", md: "22px" }}
              fontWeight="bold" color="var(--px-text)" lineHeight={1}
              sx={{
                textShadow: displayMain ? `0 0 18px ${accent}55` : "none",
                transition: "text-shadow 0.3s",
              }}
            >
              {displayMain ?? "—"}
            </Text>
            {subValue && (
              <Text fontSize="11px" color="var(--px-text-muted)" mb="1px">
                {subValue}
              </Text>
            )}
          </HStack>
        </Box>

        <Box
          w="40px" h="40px" bg={`${accent}1a`}
          border={`1px solid ${accent}44`} borderRadius="12px"
          display="flex" alignItems="center" justifyContent="center"
          flexShrink={0}
          sx={{
            transition: "background 0.2s, transform 0.2s",
            ".group:hover &": { background: `${accent}2e`, transform: "scale(1.1)" },
          }}
        >
          {doPulse ? (
            <Box
              as={Icon as any} width="18px" height="18px" color={accent}
              css={{ animation: `${pulse} 2s ease-in-out infinite` }}
            />
          ) : (
            <Icon width={18} height={18} color={accent} />
          )}
        </Box>
      </HStack>
    </MotionBox>
  );
};

export const Statistics: FC<BoxProps> = (props) => {
  const { version } = useDashboard();
  const { data: systemData } = useQuery({
    queryKey: StatisticsQueryKey,
    queryFn: () => fetch("/system"),
    refetchInterval: 5000,
    onSuccess: ({ version: currentVersion }: any) => {
      if (version !== currentVersion)
        useDashboard.setState({ version: currentVersion });
    },
  });
  const { t } = useTranslation();

  const memUsed  = systemData ? formatBytes(systemData.mem_used, 1, true) : null;
  const memTotal = systemData ? formatBytes(systemData.mem_total, 1) : null;
  const totalTraffic = systemData
    ? systemData.incoming_bandwidth + systemData.outgoing_bandwidth
    : 0;

  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} gap={3} {...props}>
      <StatCard
        title={t("activeUsers")}
        mainValue={systemData ? numberWithCommas(systemData.users_active) : null}
        numericTarget={systemData?.users_active}
        subValue={systemData ? `/ ${numberWithCommas(systemData.total_user)}` : undefined}
        icon={UsersIcon} accent="#3b82f6" delay={0}
      />
      <StatCard
        title="Online Now"
        mainValue={systemData?.users_online != null ? numberWithCommas(systemData.users_online) : null}
        numericTarget={systemData?.users_online}
        icon={SignalIcon} accent="#10b981" delay={0.07} doPulse
      />
      <StatCard
        title={t("dataUsage")}
        mainValue={systemData ? formatBytes(totalTraffic) : null}
        icon={ChartBarIcon} accent="#8b5cf6" delay={0.14}
      />
      <StatCard
        title="Today Traffic"
        mainValue={systemData != null ? formatBytes(systemData.traffic_today ?? 0) : null}
        icon={BoltIcon} accent="#f59e0b" delay={0.21}
      />
      <StatCard
        title={t("memoryUsage")}
        mainValue={memUsed ? `${memUsed[0]}` : null}
        subValue={memUsed && memTotal ? `${memUsed[1]} / ${memTotal}` : undefined}
        icon={ChartPieIcon} accent="#ec4899" delay={0.28}
      />
      <StatCard
        title="CPU Usage"
        mainValue={null}
        numericTarget={systemData?.cpu_usage != null ? Math.round(systemData.cpu_usage) : undefined}
        unit="%"
        icon={CpuChipIcon} accent="#06b6d4" delay={0.35}
      />
    </SimpleGrid>
  );
};
