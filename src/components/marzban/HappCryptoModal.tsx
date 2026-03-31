import {
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
  Select,
  Text,
  Textarea,
  VStack,
  chakra,
  useToast,
} from "@chakra-ui/react";
import { XMarkIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { FC, useState } from "react";

const CloseIcon = chakra(XMarkIcon, { baseStyle: { w: 5, h: 5 } });

type HappCryptoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HWID_DEVICE_OPTIONS = [
  "No limit (old method)",
  "1 Device",
  "2 Devices",
  "3 Devices",
  "5 Devices",
  "Unlimited",
];

export const HappCryptoModal: FC<HappCryptoModalProps> = ({ isOpen, onClose }) => {
  const [source, setSource] = useState("");
  const [hwid, setHwid] = useState("");
  const [hwid_device_limit, setHwidDeviceLimit] = useState("No limit (old method)");
  const [binding_reset, setBindingReset] = useState("");
  const [encrypted, setEncrypted] = useState("");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const toast = useToast();

  const inputStyle = {
    bg: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.12)",
    color: "white",
    _placeholder: { color: "gray.600" },
    _focusVisible: { borderColor: "primary.500", boxShadow: "none" },
    borderRadius: "8px",
    fontSize: "sm",
  };

  const handleEncrypt = async () => {
    if (!source.trim()) {
      toast({ title: "Please paste a source link", status: "warning", duration: 2000 });
      return;
    }
    setIsEncrypting(true);
    await new Promise((r) => setTimeout(r, 700));
    const mockEncrypted = `happ://crypt4/${btoa(source + "|" + hwid + "|" + hwid_device_limit).slice(0, 32)}...`;
    setEncrypted(mockEncrypted);
    setIsEncrypting(false);
  };

  const handleCopy = () => {
    if (!encrypted) return;
    navigator.clipboard.writeText(encrypted);
    toast({ title: "Copied to clipboard", status: "success", duration: 1500 });
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
            <Text fontWeight="bold" fontSize="lg" color="white">
              Happ Crypto Link
            </Text>
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
        </ModalHeader>

        <ModalBody px={4} py={4}>
          <VStack gap={3.5} align="stretch">
            {/* Source */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                Source
              </Text>
              <Textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="Paste link"
                sx={inputStyle}
                rows={3}
                resize="none"
              />
            </Box>

            {/* HWID Lock */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                HWID Lock
              </Text>
              <Input
                value={hwid}
                onChange={(e) => setHwid(e.target.value)}
                placeholder="Paste HWID"
                sx={inputStyle}
              />
            </Box>

            {/* HWID device limit */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                HWID device limit
              </Text>
              <Select
                value={hwid_device_limit}
                onChange={(e) => setHwidDeviceLimit(e.target.value)}
                sx={inputStyle}
                icon={<></>}
              >
                {HWID_DEVICE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt} style={{ background: "#0d1526" }}>
                    {opt}
                  </option>
                ))}
              </Select>
            </Box>

            {/* HWID Binding Reset */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                HWID Binding Reset
              </Text>
              <HStack gap={2}>
                <Input
                  value={binding_reset}
                  onChange={(e) => setBindingReset(e.target.value)}
                  placeholder="e.g. Bekisj"
                  sx={inputStyle}
                  flex={1}
                />
                <Button
                  size="sm"
                  variant="outline"
                  borderColor="rgba(255,255,255,0.12)"
                  color="white"
                  _hover={{ bg: "rgba(255,255,255,0.07)" }}
                  borderRadius="8px"
                  onClick={() => setBindingReset("")}
                >
                  Clear
                </Button>
              </HStack>
            </Box>

            {/* Encrypted link output */}
            <Box>
              <Text fontSize="sm" color="gray.400" mb={1.5} fontWeight="medium">
                Encrypted link
              </Text>
              <Textarea
                value={encrypted}
                readOnly
                placeholder="happ://crypt4/..."
                sx={{
                  ...inputStyle,
                  color: encrypted ? "primary.300" : "gray.600",
                  cursor: "default",
                  _focusVisible: { borderColor: "rgba(255,255,255,0.12)", boxShadow: "none" },
                }}
                rows={3}
                resize="none"
              />
            </Box>

            {/* Action buttons */}
            <HStack gap={2}>
              <Button
                flex={1}
                bg="primary.700"
                color="white"
                _hover={{ bg: "primary.600" }}
                borderRadius="10px"
                isLoading={isEncrypting}
                onClick={handleEncrypt}
                fontSize="sm"
              >
                Encrypt
              </Button>
              <Button
                flex={1}
                variant="outline"
                borderColor="rgba(255,255,255,0.12)"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.07)" }}
                borderRadius="10px"
                leftIcon={<ClipboardIcon width={16} />}
                onClick={handleCopy}
                isDisabled={!encrypted}
                fontSize="sm"
              >
                Copy
              </Button>
              <Button
                flex={1}
                variant="outline"
                borderColor="rgba(255,255,255,0.12)"
                color="white"
                _hover={{ bg: "rgba(255,255,255,0.07)" }}
                borderRadius="10px"
                onClick={onClose}
                fontSize="sm"
              >
                Cancel
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
