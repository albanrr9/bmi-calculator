import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";
import { useState } from "react";

const getBMICategory = (bmi) => {
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "Underweight";
  if (bmiValue < 25) return "Normal Weight";
  if (bmiValue < 30) return "Overweight";
  return "Obese";
};

const getBMIColor = (bmi) => {
  const bmiValue = parseFloat(bmi);
  if (bmiValue < 18.5) return "#3498DB"; // Blue
  if (bmiValue < 25) return "#2ECC71"; // Green
  if (bmiValue < 30) return "#F39C12"; // Orange
  return "#E74C3C"; // Red
};

export default function App() {
    const [height, setHeight] = useState("");
    const [weight, setWeight] = useState("");
    const [bmi, setBmi] = useState("");
    const [isCalculated, setIsCalculated] = useState(false);

    const calculateBMI = () => {
        if (isCalculated) {
          setHeight("");
          setWeight("");
          setBmi("");
          setIsCalculated(false);
          Keyboard.dismiss();
          return;
        }
        const cleanHeight = height.replace(",", ".");
        const cleanWeight = weight.replace(",", ".");

        const heightInMeters = parseFloat(cleanHeight) / 100;
        const weightInKg = parseFloat(cleanWeight);

        if (!height || !weight) {
            alert('Please enter both height and weight');
            return;
        }
        if (heightInMeters <= 0 || weightInKg <= 0) {
            alert('Please enter valid positive numbers');
            return;
        }

        const MIN_HEIGHT_CM = 5;
        const MIN_WEIGHT_KG = 0.2;

        const MAX_HEIGHT_CM = 300;
        const MAX_WEIGHT_KG = 600;

        const currentHeightCm = parseFloat(cleanHeight);

        if (
          currentHeightCm < MIN_HEIGHT_CM ||
          currentHeightCm > MAX_HEIGHT_CM
        ) {
          alert(
            `Height must be between ${MIN_HEIGHT_CM} cm and ${MAX_HEIGHT_CM} cm.`
          );
          Keyboard.dismiss();
          return;
        }

        if (weightInKg < MIN_WEIGHT_KG || weightInKg > MAX_WEIGHT_KG) {
          alert(
            `Weight must be between ${MIN_WEIGHT_KG} kg and ${MAX_WEIGHT_KG} kg.`
          );
          Keyboard.dismiss();
          return;
        }

        const bmiValue = weightInKg / (heightInMeters * heightInMeters);
        console.log("Calculated BMI:", bmiValue);
        setBmi(bmiValue.toFixed(1));
        setIsCalculated(true);
        Keyboard.dismiss();
    };

    return (
      <View style={styles.container}>
        <Text style={styles.title}>BMI Calculator</Text>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Height (cm)</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            placeholder="Enter height"
            keyboardType="numeric"
            editable={!isCalculated}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
            keyboardType="numeric"
            editable={!isCalculated}
          />
        </View>
        <TouchableOpacity
          style={[styles.button, isCalculated && NEW_CALCULATION_BUTTON_STYLES.button,]}
          onPress={calculateBMI}
        >
          <Text style={styles.buttonText}>
            {isCalculated ? "New Calculation" : "Calculate BMI"}
          </Text>
        </TouchableOpacity>
        {bmi ? (
          <View style={styles.resultContainer}>
            <Text style={styles.resultLabel}>Your BMI:</Text>
            <Text style={styles.resultValue}>{bmi}</Text>
            <View
              style={[
                styles.categoryBadge,
                { backgroundColor: getBMIColor(bmi) },
              ]}
            >
              <Text style={styles.categoryText}>{getBMICategory(bmi)}</Text>
            </View>
          </View>
        ) : null}
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // Lighter, more modern background color
    padding: 25,
    paddingTop: 60,
  },
  title: {
    fontSize: 34,
    fontWeight: "800", // Bolder title
    textAlign: "center",
    marginBottom: 40,
    color: "#2C3E50",
    textShadowColor: "rgba(0, 0, 0, 0.1)", // Subtle shadow for depth
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 8,
    color: "#34495E",
  },
  input: {
    backgroundColor: "#FFFFFF",
    // Use shadow instead of border for a floating effect
    borderRadius: 12, // More rounded corners
    padding: 18,
    fontSize: 18,
    // iOS Shadow properties
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    // Android elevation
    elevation: 8,
    color: "#2C3E50", // Ensure text is dark and readable
  },
  button: {
    // Keep the core color, but enhance the look
    backgroundColor: "#3498DB",
    padding: 20,
    borderRadius: 15, // Large radius for a softer button
    alignItems: "center",
    marginTop: 20,
    // Add a strong shadow for a "lifted" effect
    shadowColor: "#3498DB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5, // Slight letter spacing for impact
  },
  resultContainer: {
    backgroundColor: "#FFFFFF",
    padding: 35, // More generous padding
    borderRadius: 20, // Very rounded for a card-like feel
    alignItems: "center",
    marginTop: 40,
    // Stronger card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1, // Add a subtle border to define the card edge
    borderColor: "#E1E8EE",
  },
  resultLabel: {
    fontSize: 20,
    color: "#7F8C8D",
    marginBottom: 10,
  },
  resultValue: {
    fontSize: 60, // Larger, dominant number
    fontWeight: "900", // Extra bold
    color: "#2C3E50",
    marginBottom: 15, // Add space below the number
  },
  categoryBadge: {
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 25, // Pill shape
    marginTop: 15,
    // Subtle shadow for the badge to pop
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 5,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "bold",
    textTransform: "uppercase", // Category text is uppercase
  },
});

const NEW_CALCULATION_BUTTON_STYLES = StyleSheet.create({
    button: {
        backgroundColor: "#ff5444ff",
        borderColor: "#E74C3C",
        borderWidth: 2,
        shadowColor: "transparent",
        padding: 20,
        borderRadius: 15,
        alignItems: "center",
        marginTop: 20,
        elevation: 0,
    },
    buttonText: {
        color: "#E74C3C",
        fontSize: 20,
        fontWeight: "bold",
        letterSpacing: 0.5,
    },
});