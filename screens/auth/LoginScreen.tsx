import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthStackParamList } from "../../src/types/navigation";
import { AppMiddleware } from "../../lib/middleware";

// Validation functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/\d/.test(password)) {
    return "Password must contain at least one number";
  }
  return null;
};

type LoginScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  "Login"
>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  const middleware = AppMiddleware.getInstance();

  const validateForm = () => {
    const newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Please enter your email.";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email format.";
    }

    if (!password.trim()) {
      newErrors.password = "Please enter your password.";
    } else {
      const passwordError = validatePassword(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    const result = await middleware.signInWithLoading(email, password);

    if (result?.success) {
      Alert.alert("Login Successful", "Welcome!");
      setEmail("");
      setPassword("");
    } else {
      Alert.alert("Login Error", result?.error || "Unknown error occurred");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.authContainer}>
          <Text style={styles.title}>Login</Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errors.email)
                    setErrors((prev) => ({ ...prev, email: "" }));
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                placeholder="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errors.password)
                    setErrors((prev) => ({ ...prev, password: "" }));
                }}
                secureTextEntry
                autoComplete="password"
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleSignIn}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => navigation.navigate("SignUp")}
              activeOpacity={0.7}
            >
              <Text style={styles.switchButtonText}>
                Don't have an account? Sign up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    color: "#333",
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  inputError: {
    borderColor: "#ff3b30",
    borderWidth: 2,
  },
  errorText: {
    color: "#ff3b30",
    fontSize: 14,
    marginTop: 5,
    marginLeft: 5,
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  switchButton: {
    alignItems: "center",
    padding: 10,
  },
  switchButtonText: {
    color: "#007AFF",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
