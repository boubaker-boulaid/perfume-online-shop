@php
    $money = fn ($v) => number_format((float) $v, 2, ',', ' ') . ' DH';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Order Confirmation</title>
    <style>
        @media screen and (max-width: 620px) {
            .container { width: 100% !important; }
            .pad { padding: 24px 16px 0 !important; }
            .pad-header { padding: 22px 16px 18px !important; }
            .pad-footer { padding: 20px 16px !important; }
            .brand { font-size: 18px !important; letter-spacing: 4px !important; }
            .hide-sm { display: none !important; }
            .totals { float: none !important; width: 100% !important; margin-bottom: 24px !important; }
            .summary-cell { padding: 12px 14px !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f6f4ef; font-family:Helvetica, Arial, sans-serif;">
    {{-- preheader, invisible but picked up by mail clients --}}
    <div style="display:none; max-height:0; overflow:hidden;">
        Order {{ $order->order_number }} confirmed — thank you for shopping with Lume-Perfums.
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f6f4ef; padding:24px 12px;">
        <tr>
            <td align="center">
                <table role="presentation" class="container" width="600" cellpadding="0" cellspacing="0" style="width:600px; max-width:100%;">

                    {{-- header --}}
                    <tr>
                        <td align="center" class="pad-header" style="background-color:#221a12; padding:28px 40px 24px; border-radius:16px 16px 0 0;">
                            <span class="brand" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; letter-spacing:6px; color:#ffffff; text-decoration:none;">LUME</span>
                            <span class="brand" style="font-family:Georgia, 'Times New Roman', serif; font-size:22px; letter-spacing:6px; color:#c8a24a;">PERFUMS</span>
                        </td>
                    </tr>

                    {{-- body --}}
                    <tr>
                        <td class="pad" style="background-color:#ffffff; padding:40px 40px 0; border-left:1px solid #e8e1d6; border-right:1px solid #e8e1d6;">

                            <h1 style="margin:0 0 8px; font-family:Georgia, 'Times New Roman', serif; font-size:26px; color:#221a12;">
                                Thank you, {{ $order->customer_name }}!
                            </h1>
                            <p style="margin:0 0 28px; font-size:14px; line-height:22px; color:#6d635a;">
                                Your order has been received and is being prepared. We will confirm the
                                delivery details with you by phone or WhatsApp shortly.
                            </p>

                            {{-- order summary box --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf9f5; border:1px solid #e8e1d6; border-radius:12px; margin-bottom:32px;">
                                <tr>
                                    <td class="summary-cell" style="padding:16px 20px;">
                                        <span style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#a2957f;">Order number</span><br>
                                        <span style="font-family:Georgia, 'Times New Roman', serif; font-size:18px; color:#221a12;">{{ $order->order_number }}</span>
                                    </td>
                                    <td align="right" class="summary-cell" style="padding:16px 20px;">
                                        <span style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#a2957f;">Placed on</span><br>
                                        <span style="font-size:14px; color:#221a12;">{{ $order->created_at?->format('d/m/Y H:i') }}</span>
                                    </td>
                                </tr>
                            </table>

                            {{-- items — the unit price column hides on small screens --}}
                            <h2 style="margin:0 0 12px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#221a12;">Your items</h2>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:28px;">
                                <tr>
                                    <th align="left" style="border-bottom:2px solid #221a12; padding:8px 8px 8px 0; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Product</th>
                                    <th align="center" style="border-bottom:2px solid #221a12; padding:8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Qty</th>
                                    <th align="right" class="hide-sm" style="border-bottom:2px solid #221a12; padding:8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Price</th>
                                    <th align="right" style="border-bottom:2px solid #221a12; padding:8px 0 8px 8px; font-size:11px; letter-spacing:1px; text-transform:uppercase; color:#a2957f;">Total</th>
                                </tr>
                                @forelse ($order->items as $item)
                                    <tr>
                                        <td style="border-bottom:1px solid #eeeadf; padding:14px 8px 14px 0; font-size:14px; color:#221a12; word-wrap:break-word;">{{ $item->product_name }}</td>
                                        <td align="center" style="border-bottom:1px solid #eeeadf; padding:14px 8px; font-size:14px; color:#6d635a;">x{{ $item->quantity }}</td>
                                        <td align="right" class="hide-sm" style="border-bottom:1px solid #eeeadf; padding:14px 8px; font-size:14px; color:#6d635a;">{{ $money($item->unit_price) }}</td>
                                        <td align="right" style="border-bottom:1px solid #eeeadf; padding:14px 0 14px 8px; font-size:14px; color:#221a12;">{{ $money($item->line_total) }}</td>
                                    </tr>
                                @empty
                                    <tr>
                                        <td colspan="4" style="padding:14px 0; font-size:14px; color:#a2957f;">No items recorded for this order.</td>
                                    </tr>
                                @endforelse
                            </table>

                            {{-- totals — floats right on desktop, full width on mobile --}}
                            <table role="presentation" class="totals" width="100%" cellpadding="0" cellspacing="0" align="right" style="width:240px; float:right; margin-bottom:32px; font-size:14px; color:#221a12;">
                                <tr>
                                    <td style="padding:6px 0; color:#6d635a;">Subtotal</td>
                                    <td align="right" style="padding:6px 0;">{{ $money($order->subtotal) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0; color:#6d635a;">Shipping</td>
                                    <td align="right" style="padding:6px 0;">{{ $order->shipping_cost == 0 ? 'Free' : $money($order->shipping_cost) }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px 0 0; border-top:2px solid #221a12; font-family:Georgia, 'Times New Roman', serif; font-size:16px;">Total</td>
                                    <td align="right" style="padding:12px 0 0; border-top:2px solid #221a12; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#c8a24a;">{{ $money($order->total) }}</td>
                                </tr>
                            </table>
                            <div style="clear:both;"></div>

                            {{-- delivery details --}}
                            <h2 style="margin:32px 0 12px; font-family:Georgia, 'Times New Roman', serif; font-size:16px; color:#221a12;">Delivery details</h2>
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px; color:#6d635a; margin-bottom:32px;">
                                <tr>
                                    <td style="padding:6px 0; width:110px; color:#a2957f;">Recipient</td>
                                    <td style="padding:6px 0; color:#221a12;">{{ $order->customer_name }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">Phone</td>
                                    <td style="padding:6px 0; color:#221a12;">{{ $order->phone }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">City</td>
                                    <td style="padding:6px 0; color:#221a12;">{{ $order->city ?? '—' }}</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 0;">Address</td>
                                    <td style="padding:6px 0; color:#221a12; word-wrap:break-word;">{{ $order->address ?? '—' }}</td>
                                </tr>
                                @if ($order->note)
                                    <tr>
                                        <td style="padding:6px 0;">Note</td>
                                        <td style="padding:6px 0; color:#221a12; word-wrap:break-word;">{{ $order->note }}</td>
                                    </tr>
                                @endif
                            </table>

                            <p style="margin:0 0 32px; font-size:13px; line-height:20px; color:#6d635a;">
                                Payment is made on delivery. If you have any questions, simply reply to this
                                email and we will get back to you as soon as possible.
                            </p>
                        </td>
                    </tr>

                    {{-- footer --}}
                    <tr>
                        <td align="center" class="pad-footer" style="background-color:#221a12; padding:28px 40px; border-radius:0 0 16px 16px;">
                            <p class="brand" style="margin:0 0 6px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:4px; color:#c8a24a;">LUME PERFUMS</p>
                            <p style="margin:0; font-size:12px; line-height:18px; color:#8a7f72;">
                                You are receiving this email because you placed an order on our online store.<br>
                                This is an automatic confirmation — no reply is required.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
