import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from "@chakra-ui/react";
import {
  ArrowLeftIcon,
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { chakra } from "@chakra-ui/react";
import { FC, useState } from "react";

const BackIcon = chakra(ArrowLeftIcon, { baseStyle: { w: 4, h: 4 } });
const RefreshIcon = chakra(ArrowPathIcon, { baseStyle: { w: 4, h: 4 } });
const NotifIcon = chakra(BellIcon, { baseStyle: { w: 4, h: 4 } });
const PrevIcon = chakra(ChevronLeftIcon, { baseStyle: { w: 4, h: 4 } });
const NextIcon = chakra(ChevronRightIcon, { baseStyle: { w: 4, h: 4 } });

const MOCK_ADMINS = [
  { username: "test", user_count: 1 },
  { username: "m077", user_count: 0 },
  { username: "kesxa", user_count: 4 },
  { username: "lady", user_count: 13 },
  { username: "ali", user_count: 24 },
  { username: "rechkadiller", user_count: 11 },
  { username: "rechka", user_count: 12 },
  { username: "berdi", user_count: 0 },
];

const MOCK_ACTIONS = [
  { time: "2026-03-04 21:03:06", action: "Set users traffic limit for ali_veli → 100 GB", admin: "test" },
  { time: "2026-03-03 15:22:11", action: "Created user mp2Nox, Traffic: 100GB; IP limit: 3", admin: "test" },
  { time: "2026-02-25 21:33:50", action: "Created user TpIY1s, Traffic: 101GB; IP limit: 3", admin: "test" },
  { time: "2026-02-25 21:33:45", action: "Created user MDln5Z, Traffic: 101GB; IP limit: 3", admin: "test" },
  { time: "2026-02-17 19:29:29", action: "Created user qSofQc, Traffic: 100GB; IP limit: 3", admin: "test" },
];

const MOCK_NOTIFICATIONS = [
  { time: "2026-02-25 21:33:50", user: "TpIY1s", admin: "test", info: "Traffic: - → 101.00 GB; IP limit: 3" },
  { time: "2026-02-25 21:33:45", user: "MDln5Z", admin: "test", info: "Traffic: - → 101.00 GB; IP limit: 3" },
  { time: "2026-02-17 19:29:29", user: "qSofQc", admin: "test", info: "Traffic: - → 100.00 GB; IP limit: 3" },
  { time: "2026-02-17 19:19:02", user: "mp2Nox", admin: "test", info: "Traffic: - → 100.00 GB; IP limit: 3" },
];

const glass = {
  bg: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
};

type AdminManagerModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AdminManagerModal: FC<AdminManagerModalProps> = ({ isOpen, onClose }) => {
  const [selectedAdmin, setSelectedAdmin] = useState("test");
  const [showNotifs, setShowNotifs] = useState(false);
  const [page, setPage] = useState(0);
  const ACTIONS_PER_PAGE = 5;
  const pagedActions = MOCK_ACTIONS.slice(page * ACTIONS_PER_PAGE, (page + 1) * ACTIONS_PER_PAGE);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" scrollBehavior="inside">
      <ModalOverlay bg="rgba(0,0,0,0.7)" backdropFilter="blur(8px)" />
      <ModalContent
        bg="#0d1526"
        border="1px solid rgba(255,255,255,0.1)"
        borderRadius="16px"
        mx={3}
        maxH="85vh"
        overflow="hidden"
      >
        <ModalHeader px={4} py={3} borderBottom="1px solid rgba(255,255,255,0.07)">
          <HStack>
            <IconButton
              aria-label="back"
              icon={<BackIcon />}
              size="sm"
              variant="ghost"
              color="white"
              onClick={onClose}
              _hover={{ bg: "rgba(255,255,255,0.07)" }}
            />
            <Text fontWeight="bold" fontSize="lg" color="white">
              Admin Manager
            </Text>
          </HStack>
        </ModalHeader>
        <ModalBody px={4} py={4} overflowY="auto">
          <VStack gap={4} align="stretch">
            {/* Admins card */}
            <Box {...glass} p={3}>
              <HStack justifyContent="space-between" mb={3}>
                <Text fontWeight="semibold" color="white" fontSize="sm">
                  Admins
                </Text>
                <Button
                  size="xs"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.15)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.07)" }}
                  leftIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
              </HStack>
              <VStack gap={1} align="stretch">
                {MOCK_ADMINS.map((admin) => (
                  <HStack
                    key={admin.username}
                    justifyContent="space-between"
                    px={3}
                    py={1.5}
                    borderRadius="8px"
                    cursor="pointer"
                    onClick={() => setSelectedAdmin(admin.username)}
                    bg={
                      selectedAdmin === admin.username
                        ? "rgba(59,130,246,0.15)"
                        : "rgba(255,255,255,0.03)"
                    }
                    border="1px solid"
                    borderColor={
                      selectedAdmin === admin.username
                        ? "rgba(59,130,246,0.3)"
                        : "rgba(255,255,255,0.06)"
                    }
                    _hover={{ bg: "rgba(255,255,255,0.06)" }}
                  >
                    <Text color="white" fontSize="sm">
                      {admin.username}
                    </Text>
                    <Badge
                      bg={admin.user_count > 0 ? "rgba(59,130,246,0.2)" : "rgba(255,255,255,0.06)"}
                      color={admin.user_count > 0 ? "primary.300" : "gray.500"}
                      borderRadius="full"
                      px={2}
                      fontSize="xs"
                    >
                      {admin.user_count}
                    </Badge>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* All-time stats */}
            <Box {...glass} p={3}>
              <Text fontWeight="semibold" color="white" fontSize="sm" mb={3}>
                All-time stats
              </Text>
              <VStack gap={2} align="stretch">
                {[
                  { label: "Created users", value: 13, color: "green.400" },
                  { label: "Extended users", value: 3, color: "yellow.400" },
                  { label: "Deleted users", value: 12, color: "red.400" },
                ].map((stat) => (
                  <HStack key={stat.label} justifyContent="space-between">
                    <Text fontSize="sm" color="gray.400">
                      {stat.label}
                    </Text>
                    <HStack gap={2}>
                      <Badge
                        bg="rgba(255,255,255,0.06)"
                        color={stat.color}
                        borderRadius="full"
                        px={2}
                        fontSize="sm"
                        fontWeight="bold"
                      >
                        {stat.value}
                      </Badge>
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="rgba(255,255,255,0.12)"
                        color="gray.300"
                        _hover={{ bg: "rgba(255,255,255,0.07)" }}
                        fontSize="xs"
                      >
                        View list
                      </Button>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Admin stats section */}
            <Box {...glass} p={3}>
              <Text fontWeight="semibold" color="white" fontSize="sm" mb={2}>
                Stats: {selectedAdmin}
              </Text>
              <HStack gap={2} mb={3} flexWrap="wrap">
                <Badge bg="rgba(255,255,255,0.06)" color="gray.300" borderRadius="full" px={2} py={0.5}>
                  USERS: {MOCK_ADMINS.find((a) => a.username === selectedAdmin)?.user_count ?? 0}
                </Badge>
                <Badge bg="rgba(34,197,94,0.15)" color="green.400" borderRadius="full" px={2} py={0.5}>
                  ACTIONS (24H): 1
                </Badge>
              </HStack>

              <HStack gap={2} mb={3}>
                {/* Notifications bell */}
                <Box position="relative">
                  <IconButton
                    aria-label="notifications"
                    icon={<NotifIcon />}
                    size="sm"
                    variant="ghost"
                    color="white"
                    _hover={{ bg: "rgba(255,255,255,0.07)" }}
                    onClick={() => setShowNotifs(!showNotifs)}
                  />
                  <Badge
                    position="absolute"
                    top="0"
                    right="0"
                    bg="primary.500"
                    color="white"
                    borderRadius="full"
                    fontSize="9px"
                    w="16px"
                    h="16px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    {MOCK_NOTIFICATIONS.length}
                  </Badge>
                </Box>
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.12)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.07)" }}
                  leftIcon={<RefreshIcon />}
                >
                  Refresh
                </Button>
                <IconButton
                  aria-label="prev"
                  icon={<PrevIcon />}
                  size="sm"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.12)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.07)" }}
                  isDisabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                />
                <IconButton
                  aria-label="next"
                  icon={<NextIcon />}
                  size="sm"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.12)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.07)" }}
                  isDisabled={(page + 1) * ACTIONS_PER_PAGE >= MOCK_ACTIONS.length}
                  onClick={() => setPage((p) => p + 1)}
                />
              </HStack>

              {/* Actions table */}
              {!showNotifs ? (
                <Box overflow="auto">
                  <Table size="sm" variant="unstyled">
                    <Thead>
                      <Tr>
                        <Th color="gray.500" fontSize="11px" pb={2} pl={0}>
                          TIME
                        </Th>
                        <Th color="gray.500" fontSize="11px" pb={2}>
                          ACTION
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pagedActions.map((a, i) => (
                        <Tr key={i}>
                          <Td pl={0} py={2} fontSize="xs" color="gray.400" whiteSpace="nowrap">
                            {a.time}
                          </Td>
                          <Td py={2} fontSize="xs" color="gray.300">
                            {a.action}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <VStack gap={2} align="stretch">
                  <Text fontSize="sm" fontWeight="semibold" color="white">
                    Notifications
                  </Text>
                  {MOCK_NOTIFICATIONS.map((n, i) => (
                    <Box
                      key={i}
                      p={3}
                      bg="rgba(255,255,255,0.03)"
                      border="1px solid rgba(255,255,255,0.07)"
                      borderRadius="10px"
                    >
                      <Text fontSize="11px" color="gray.500" mb={0.5}>
                        {n.time}
                      </Text>
                      <Text fontSize="sm" fontWeight="semibold" color="white" mb={0.5}>
                        {n.user}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        Admin: {n.admin}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {n.info}
                      </Text>
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
