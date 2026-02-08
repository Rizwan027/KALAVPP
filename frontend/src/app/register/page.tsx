'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '@/store';
import { setCredentials } from '@/store/slices/authSlice';
import { authApi } from '@/lib/auth';
import toast from 'react-hot-toast';

const registerSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Must contain uppercase letter')
    .matches(/[a-z]/, 'Must contain lowercase letter')
    .matches(/[0-9]/, 'Must contain number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/, 'Must contain special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  firstName: Yup.string().min(2, 'Too short').max(100, 'Too long'),
  lastName: Yup.string().min(2, 'Too short').max(100, 'Too long'),
  role: Yup.string().oneOf(['customer', 'vendor']).required('Role is required'),
});

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  
  const defaultRole = searchParams.get('role') === 'vendor' ? 'vendor' : 'customer';

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      role: defaultRole,
    },
    validationSchema: registerSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const { confirmPassword, ...registerData } = values;
        const response = await authApi.register({
          ...registerData,
          role: registerData.role as 'customer' | 'vendor',
        });
        
        dispatch(
          setCredentials({
            user: response.data.user,
            accessToken: response.data.tokens.accessToken,
            refreshToken: response.data.tokens.refreshToken,
          })
        );

        toast.success('Registration successful!');
        
        // Redirect based on role
        if (response.data.user.role === 'vendor') {
          toast.info('Your vendor account is pending approval');
          router.push('/vendor/pending');
        } else {
          router.push('/');
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="mt-2 text-gray-600">Join the KALAVPP community</p>
        </div>

        <div className="card">
          <form onSubmit={formik.handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I want to
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('role', 'customer')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formik.values.role === 'customer'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">Buy Art</p>
                  <p className="text-xs text-gray-600">Customer</p>
                </button>
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('role', 'vendor')}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    formik.values.role === 'vendor'
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-semibold">Sell Art</p>
                  <p className="text-xs text-gray-600">Vendor</p>
                </button>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...formik.getFieldProps('firstName')}
                  className="input mt-1"
                  placeholder="John"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...formik.getFieldProps('lastName')}
                  className="input mt-1"
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...formik.getFieldProps('email')}
                className={`input mt-1 ${
                  formik.touched.email && formik.errors.email ? 'input-error' : ''
                }`}
                placeholder="you@example.com"
              />
              {formik.touched.email && formik.errors.email && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...formik.getFieldProps('password')}
                className={`input mt-1 ${
                  formik.touched.password && formik.errors.password ? 'input-error' : ''
                }`}
                placeholder="••••••••"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...formik.getFieldProps('confirmPassword')}
                className={`input mt-1 ${
                  formik.touched.confirmPassword && formik.errors.confirmPassword
                    ? 'input-error'
                    : ''
                }`}
                placeholder="••••••••"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.confirmPassword}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
