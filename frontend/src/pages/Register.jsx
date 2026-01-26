              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreeToTerms}
                    onChange={(e) => setAgreeToTerms(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link component={RouterLink} to="/terms">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link component={RouterLink} to="/privacy">
                      Privacy Policy
                    </Link>
                  </Typography>
                }
              />
              {errors.terms && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {errors.terms}
                </Alert>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                size="large"
                sx={{ mt: 2 }}
              >
                Create Account
              </Button>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Already have an account?{' '}
                  <Link component={RouterLink} to="/login">
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Grid>
            
            {/* Demo Data Notice */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  For demonstration purposes, this form doesn't connect to a backend.
                  Fill in any data to see the form validation.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default RegisterPage;