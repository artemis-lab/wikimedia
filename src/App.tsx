import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";

import { MantineProvider } from "@mantine/core";
import { Provider } from "react-redux";

import { EventsLayout } from "./components/events";
import { setupStore } from "./store/store";

// Create store once at module level to prevent recreation on every render
const store = setupStore();

const App = () => {
  return (
    <Provider store={store}>
      <MantineProvider>
        <EventsLayout />
      </MantineProvider>
    </Provider>
  );
};

export default App;
