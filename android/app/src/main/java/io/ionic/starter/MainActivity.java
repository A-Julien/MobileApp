package io.ionic.starter;

import android.content.res.Configuration;
import android.os.Build;
import android.os.Bundle;
import android.webkit.WebSettings;

import androidx.annotation.RequiresApi;

import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;
import com.codetrixstudio.capacitor.GoogleAuth.GoogleAuth;

public class MainActivity extends BridgeActivity {
  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);

    // Initializes the Bridge
    this.init(savedInstanceState, new ArrayList<Class<? extends Plugin>>() {{
    add(com.getcapacitor.community.facebooklogin.FacebookLogin.class);

      // Additional plugins you've installed go here
      // Ex: add(TotallyAwesomePlugin.class);
    add(GoogleAuth.class);
    }});
  }
  @RequiresApi(api = Build.VERSION_CODES.Q)
  @Override
    public void onResume() {
      super.onResume();
      int nightModeFlags = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
      WebSettings webSettings = this.bridge.getWebView().getSettings();

      if (nightModeFlags == Configuration.UI_MODE_NIGHT_YES) {
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
          webSettings.setForceDark(WebSettings.FORCE_DARK_ON);
        }
      } else {
        webSettings.setForceDark(WebSettings.FORCE_DARK_OFF);
      }
    }
}
