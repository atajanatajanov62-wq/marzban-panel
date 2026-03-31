import {
  Badge,
  Box,
  Button,
  HStack,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  Text,
  VStack,
  chakra,
} from "@chakra-ui/react";
import { ShieldExclamationIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { FC, useState } from "react";

const CloseIcon = chakra(XMarkIcon, { baseStyle: { w: 5, h: 5 } });
const ResetIcon = chakra(ArrowPathIcon, { baseStyle: { w: 3.5, h: 3.5 } });

const MOCK_ADMINS = ["test", "m077", "kesxa", "lady", "ali", "rechkadiller", "rechka", "berdi"];
const ADMIN_OVERVIEW = [
  { name: "ali", users: 24, traffic_used: "12.4 GB" },
  { name: "kesxa", users: 4, traffic_used: "2.1 GB" },
];

type AdminLimitsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const glass = {
  bg: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "12px",
};

export const AdminLimitsModal: FC<AdminLimitsModalProps> = ({ isOpen, onClose }) => {
  const [selectedAdmin, setSelectedAdmin] = useState("test");
  const [usersLimit, setUsersLimit] = useState(2);
  const [trafficUnit, setTrafficUnit] = useState("GB");
  const [userTrafficLimit, setUserTrafficLimit] = useState(100);
  const [isSaving, setIsSaving] = useState(false);

  const selectedStats = {
    users: 0,
    traffic: "0 B",
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsSaving(false);
    onClose();
  };

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    color: "white",
    _placeholder: { color: "gray.600" },
    _focusVisible: { borderColor: "primary.500", boxShadow: "none" },
    borderRadius: "8px",
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" isCentered>
      <ModalOverlay bg="rgba(0,0,0,0.75)" backdropFilter="blur(10px)" />
      <ModalContent
        bg="#0d1526"
        border="1px solid rgba(255,255,255,0.1)"
        borderRadius="18px"
        mx={3}
      >
        <ModalHeader px={4} pt={5} pb={0}>
          <HStack justifyContent="space-between">
            <HStack gap={3}>
              <Box
                w="40px"
                h="40px"
                bg="rgba(59,130,246,0.15)"
                borderRadius="10px"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ShieldExclamationIcon width={20} color="#60a5fa" />
              </Box>
              <Box>
                <Text fontWeight="bold" fontSize="lg" color="white">
                  Admin limits
                </Text>
                <Text fontSize="xs" color="gray.500">
                  Set limits for non-sudo admins
                </Text>
              </Box>
            </HStack>
            <IconButton
              aria-label="close"
              icon={<CloseIcon />}
              size="sm"
              variant="ghost"
              color="gray.400"
              onClick={onClose}
              _hover={{ bg: "rgba(255,255,255,0.07)", color: "white" }}
            />
          </HStack>

          {/* Stats badges */}
          <HStack gap={2} mt={3}>
            <Badge
              bg="rgba(255,255,255,0.06)"
              color="gray.300"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
            >
              USERS: {selectedStats.users}
            </Badge>
            <Badge
              bg="rgba(255,255,255,0.06)"
              color="gray.300"
              borderRadius="full"
              px={3}
              py={1}
              fontSize="xs"
            >
              USED TRAFFIC: {selectedStats.traffic}
            </Badge>
          </HStack>
        </ModalHeader>

        <ModalBody px={4} py={4}>
          <VStack gap={4} align="stretch">
            {/* Admin selector */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                Admin
              </Text>
              <Select
                value={selectedAdmin}
                onChange={(e) => setSelectedAdmin(e.target.value)}
                sx={inputStyle}
                icon={<></>}
              >
                {MOCK_ADMINS.map((a) => (
                  <option key={a} value={a} style={{ background: "#0d1526" }}>
                    {a}
                  </option>
                ))}
              </Select>
            </Box>

            {/* Users limit */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                Users limit
              </Text>
              <NumberInput
                value={usersLimit}
                onChange={(_, n) => setUsersLimit(n || 0)}
                min={0}
              >
                <NumberInputField sx={inputStyle} />
                <NumberInputStepper>
                  <NumberIncrementStepper borderColor="rgba(255,255,255,0.08)" color="gray.400" />
                  <NumberDecrementStepper borderColor="rgba(255,255,255,0.08)" color="gray.400" />
                </NumberInputStepper>
              </NumberInput>
            </Box>

            {/* Traffic limit */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                Traffic limit
              </Text>
              <HStack gap={2}>
                <NumberInput flex={1} placeholder="Unlimited" min={0}>
                  <NumberInputField
                    sx={{ ...inputStyle, _placeholder: { color: "gray.600" } }}
                    placeholder="Unlimited"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper borderColor="rgba(255,255,255,0.08)" color="gray.400" />
                    <NumberDecrementStepper borderColor="rgba(255,255,255,0.08)" color="gray.400" />
                  </NumberInputStepper>
                </NumberInput>
                <Select
                  w="90px"
                  value={trafficUnit}
                  onChange={(e) => setTrafficUnit(e.target.value)}
                  sx={inputStyle}
                  icon={<></>}
                >
                  {["MB", "GB", "TB"].map((u) => (
                    <option key={u} value={u} style={{ background: "#0d1526" }}>
                      {u}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Box>

            {/* User traffic limit */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                User traffic limit
              </Text>
              <HStack gap={2}>
                <NumberInput
                  flex={1}
                  value={userTrafficLimit}
                  onChange={(_, n) => setUserTrafficLimit(n || 0)}
                  min={0}
                >
                  <NumberInputField sx={inputStyle} />
                  <NumberInputStepper>
                    <NumberIncrementStepper borderColor="rgba(255,255,255,0.08)" color="gray.400" />
                    <NumberDecrementStepper borderColor="rgba(255,255,255,0.08)" color="gray.400" />
                  </NumberInputStepper>
                </NumberInput>
                <Select
                  w="90px"
                  defaultValue="GB"
                  sx={inputStyle}
                  icon={<></>}
                >
                  {["MB", "GB", "TB"].map((u) => (
                    <option key={u} value={u} style={{ background: "#0d1526" }}>
                      {u}
                    </option>
                  ))}
                </Select>
              </HStack>
            </Box>

            {/* Admins overview */}
            <Box {...glass} p={3}>
              <Text fontSize="sm" fontWeight="semibold" color="white" mb={2}>
                Admins overview
              </Text>
              <VStack gap={1.5} align="stretch">
                {ADMIN_OVERVIEW.map((admin) => (
                  <HStack key={admin.name} justifyContent="space-between" py={1}>
                    <Text fontSize="sm" color="white">
                      {admin.name}
                    </Text>
                    <HStack gap={2}>
                      <Text fontSize="xs" color="gray.500">
                        Users: {admin.users}
                      </Text>
                      <Button
                        size="xs"
                        variant="outline"
                        borderColor="rgba(255,255,255,0.12)"
                        color="gray.300"
                        _hover={{ bg: "rgba(255,255,255,0.07)" }}
                        leftIcon={<ResetIcon />}
                        fontSize="xs"
                      >
                        Reset
                      </Button>
                    </HStack>
                  </HStack>
                ))}
              </VStack>
            </Box>

            {/* Buttons */}
            <VStack gap={2}>
              <Button
                w="full"
                variant="outline"
                borderColor="rgba(255,255,255,0.12)"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.07)" }}
                onClick={onClose}
                borderRadius="10px"
              >
                Cancel
              </Button>
              <Button
                w="full"
                bg="primary.600"
                color="white"
                _hover={{ bg: "primary.500" }}
                borderRadius="10px"
                isLoading={isSaving}
                onClick={handleSave}
              >
                save
              </Button>
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
