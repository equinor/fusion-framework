# Troubleshooting

## Common Issues

| Issue | Solution |
|-------|----------|
| **Authentication Loop** | Ensure redirect URIs match your application's routing |
| **Token Acquisition Fails** | Check that required scopes are properly configured |
| **Module Not Found** | Ensure the module is properly configured and framework is initialized |
| **Multiple MSAL Instances** | Remove duplicate configurations from child modules |
| **Redirect Returns Void** | For redirect flows, use `handleRedirect()` after navigation completes |
| **Token Empty/Undefined** | Verify user is authenticated and scopes are correct |

## Getting Help

- 📖 [MSAL Cookbook](https://github.com/equinor/fusion-framework/tree/main/cookbooks/app-react-msal) - Complete working examples
- 🐛 [Report Issues](https://github.com/equinor/fusion/issues) - Bug reports and feature requests
