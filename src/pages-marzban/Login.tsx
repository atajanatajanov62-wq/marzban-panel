import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  chakra,
  Checkbox,
  FormControl,
  HStack,
  IconButton,
  Text,
  Tooltip,
  useColorMode,
  VStack,
} from "@chakra-ui/react";
import { ArrowRightOnRectangleIcon, EyeIcon, EyeSlashIcon, MoonIcon, SunIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC, useEffect, useState } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Footer } from "components/Footer";
import { Input } from "components/Input";
import { fetch } from "service/http";
import { removeAuthToken, setAuthToken } from "utils/authStorage";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ThemePicker } from "components/ThemePicker";
import { useTheme } from "contexts/ThemeContext";

const MotionBox = motion(Box as any);

const schema = z.object({
  username: z.string().min(1, "login.fieldRequired"),
  password: z.string().min(1, "login.fieldRequired"),
});

const LoginIcon = chakra(ArrowRightOnRectangleIcon, { baseStyle: { w: 5, h: 5, strokeWidth: "2px" } });
const ShowPassIcon = chakra(EyeIcon, { baseStyle: { w: 4, h: 4 } });
const HidePassIcon = chakra(EyeSlashIcon, { baseStyle: { w: 4, h: 4 } });
const LangIcon = chakra(GlobeAltIcon, { baseStyle: { w: 4, h: 4 } });

export const Login: FC = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => localStorage.getItem("marzban-remember-me") === "true");
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { colorMode, toggleColorMode } = useColorMode();
  const location = useLocation();
  const { currentTheme } = useTheme();

  const { register, formState: { errors }, handleSubmit, setValue } = useForm({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    removeAuthToken();
    if (location.pathname !== "/login") navigate("/login", { replace: true });
    if (rememberMe) {
      const saved = localStorage.getItem("marzban-saved-username");
      if (saved) setValue("username", saved);
    }
  }, []);

  const login = (values: FieldValues) => {
    setError("");
    const formData = new FormData();
    formData.append("username", values.username);
    formData.append("password", values.password);
    formData.append("grant_type", "password");
    setLoading(true);
    fetch("/admin/token", { method: "post", body: formData })
      .then(({ access_token: token }) => {
        if (rememberMe) {
          localStorage.setItem("marzban-remember-me", "true");
          localStorage.setItem("marzban-saved-username", values.username);
        } else {
          localStorage.removeItem("marzban-remember-me");
          localStorage.removeItem("marzban-saved-username");
        }
        setAuthToken(token);
        navigate("/");
      })
      .catch((err) => {
        setError(err?.response?._data?.detail || "Invalid credentials");
      })
      .finally(setLoading.bind(null, false));
  };

  const inputStyle = {
    bg: "var(--px-glass-bg, rgba(255,255,255,0.55))",
    borderColor: "var(--px-border, rgba(0,0,0,0.1))",
    color: "var(--px-text)",
    _placeholder: { color: "var(--px-text-muted)" },
    _focusVisible: { borderColor: "var(--px-accent)", boxShadow: "0 0 0 2px rgba(var(--px-accent-rgb),0.2)" },
    borderRadius: "10px",
    fontSize: "sm",
  };

  return (
    <Box
      minH="100vh"
      bg="transparent"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="relative"
      overflow="hidden"
      p={4}
    >
      {/* Background glow effects */}
      <Box
        position="absolute"
        top="-150px"
        left="50%"
        transform="translateX(-50%)"
        w="600px"
        h="600px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${currentTheme.glow.replace("0.28", "0.1")} 0%, transparent 70%)`}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-100px"
        right="-100px"
        w="400px"
        h="400px"
        borderRadius="full"
        bg={`radial-gradient(circle, ${currentTheme.glow.replace("0.28", "0.07")} 0%, transparent 70%)`}
        pointerEvents="none"
      />

      {/* Top-right controls */}
      <HStack position="absolute" top={4} right={4} gap={2}>
        <ThemePicker />
        <Tooltip label={colorMode === "dark" ? "Light Mode" : "Dark Mode"} placement="bottom">
          <IconButton
            aria-label="toggle theme"
            icon={colorMode === "dark" ? <SunIcon width={16} /> : <MoonIcon width={16} />}
            size="sm"
            bg="var(--px-glass-bg)"
            border="1px solid var(--px-border)"
            color="var(--px-text)"
            _hover={{ bg: "var(--px-hover-bg)" }}
            borderRadius="9px"
            onClick={toggleColorMode}
          />
        </Tooltip>
      </HStack>

      {/* Login card */}
      <MotionBox
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        w="full"
        maxW="380px"
        bg="var(--px-card-bg, rgba(15,25,60,0.55))"
        border="1px solid var(--px-card-border, rgba(59,130,246,0.18))"
        borderRadius="20px"
        boxShadow={`0 20px 60px rgba(0,0,0,0.08), 0 0 40px ${currentTheme.glow.replace("0.28", "0.12")}, 0 0 0 1px var(--px-card-border)`}
        backdropFilter="blur(20px)"
        p={8}
        zIndex={1}
      >
        {/* Logo & Title */}
        <VStack gap={2} mb={8} alignItems="center">
          <Box
            w="56px"
            h="56px"
            bg={`linear-gradient(135deg, ${currentTheme.accent}, ${currentTheme.accent}99)`}
            borderRadius="16px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            boxShadow={`0 0 30px ${currentTheme.glow}`}
            mb={1}
          >
            <Text fontWeight="black" fontSize="22px" color="white" letterSpacing="-0.5px">
              PX
            </Text>
          </Box>
          <Text fontSize="xl" fontWeight="bold" color="var(--px-text)">
            Professional X Panel
          </Text>
          <Text color="var(--px-text-muted)" fontSize="sm" textAlign="center">
            {t("login.welcomeBack") || "Hesabınıza giriş yapın"}
          </Text>
        </VStack>

        <form onSubmit={handleSubmit(login)}>
          <VStack gap={4}>
            <FormControl>
              <Input
                w="full"
                placeholder={t("username") || "Kullanıcı adı"}
                {...register("username")}
                error={t(errors?.username?.message as string)}
                sx={inputStyle}
              />
            </FormControl>

            <FormControl position="relative">
              <Input
                w="full"
                type={showPassword ? "text" : "password"}
                placeholder={t("password") || "Şifre"}
                {...register("password")}
                error={t(errors?.password?.message as string)}
                pr="10"
                sx={inputStyle}
              />
              <IconButton
                aria-label="toggle password"
                icon={showPassword ? <HidePassIcon /> : <ShowPassIcon />}
                size="xs"
                variant="ghost"
                color="gray.400"
                _hover={{ color: "var(--px-text)", bg: "transparent" }}
                position="absolute"
                right="2"
                top="2"
                zIndex={2}
                onClick={() => setShowPassword(!showPassword)}
              />
            </FormControl>

            <HStack w="full" justifyContent="space-between">
              <Checkbox
                size="sm"
                colorScheme="primary"
                isChecked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              >
                <Text fontSize="sm" color="var(--px-text-muted)">
                  {t("login.rememberMe") || "Beni Hatırla"}
                </Text>
              </Checkbox>
            </HStack>

            {error && (
              <Alert status="error" borderRadius="10px" bg="rgba(239,68,68,0.1)" border="1px solid rgba(239,68,68,0.3)">
                <AlertIcon color="red.400" />
                <AlertDescription fontSize="sm" color="red.300">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              isLoading={loading}
              type="submit"
              w="full"
              bg="primary.600"
              color="white"
              _hover={{ bg: "primary.500", boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}
              _active={{ bg: "primary.700" }}
              borderRadius="10px"
              leftIcon={<LoginIcon />}
              size="md"
              transition="all 0.2s"
            >
              {t("login") || "Giriş Yap"}
            </Button>
          </VStack>
        </form>
      </MotionBox>

      <Box mt={8} zIndex={1}>
        <Footer />
      </Box>
    </Box>
  );
};

export default Login;
