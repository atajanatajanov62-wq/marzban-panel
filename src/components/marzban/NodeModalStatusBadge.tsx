import { Badge, Box, HStack, Text } from "@chakra-ui/react";

import { statusColors } from "constants/UserSettings";
import { motion } from "framer-motion";
import { FC } from "react";
import { useTranslation } from "react-i18next";
import { Status as UserStatusType } from "types/User";
import { relativeExpiryDate } from "utils/dateFormatter";

const MotionBox = motion(Box as any);

type UserStatusProps = {
  expiryDate?: number | null;
  status: UserStatusType;
  compact?: boolean;
  showDetail?: boolean;
  extraText?: string | null;
};
export const NodeModalStatusBadge: FC<UserStatusProps> = ({
  expiryDate,
  status: userStatus,
  compact = false,
  showDetail = true,
  extraText,
}) => {
  const { t } = useTranslation();
  const dateInfo = relativeExpiryDate(expiryDate);
  const Icon = statusColors[userStatus].icon;
  const isActive = userStatus === "active";

  return (
    <>
      <HStack gap={1} display="inline-flex" alignItems="center">
        {isActive && (
          <Box position="relative" w="8px" h="8px" flexShrink={0}>
            <MotionBox
              position="absolute"
              inset={0}
              borderRadius="full"
              bg="green.400"
              animate={{ scale: [1, 1.8, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            <Box w="8px" h="8px" borderRadius="full" bg="green.400" position="relative" />
          </Box>
        )}
        <Badge
          colorScheme={statusColors[userStatus].statusColor}
          rounded="full"
          display="inline-flex"
          px={3}
          py={1}
          columnGap={compact ? 1 : 2}
          alignItems="center"
        >
          <Icon w={compact ? 3 : 4} />
          {showDetail && (
            <Text
              textTransform="capitalize"
              fontSize={compact ? ".7rem" : ".875rem"}
              lineHeight={compact ? "1rem" : "1.25rem"}
              fontWeight="medium"
              letterSpacing="tighter"
            >
              {userStatus && t(`nodeModal.status.${userStatus}`)}
              {extraText && `: ${extraText}`}
            </Text>
          )}
        </Badge>
      </HStack>
      {showDetail && expiryDate && (
        <Text
          display="inline-block"
          fontSize="xs"
          fontWeight="medium"
          ml="2"
          color="gray.600"
          _dark={{
            color: "gray.400",
          }}
        >
          {t(dateInfo.status, { time: dateInfo.time })}
        </Text>
      )}
    </>
  );
};
