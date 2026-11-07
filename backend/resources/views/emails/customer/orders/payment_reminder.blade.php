@php
    $money = fn ($v) => number_format((float) $v, 2, ',', ' ') . ' DH';
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="x-apple-disable-message-reformatting">
    <title>Finalisez votre commande</title>
    <style>
        @media screen and (max-width: 620px) {
            .container { width: 100% !important; }
            .pad { padding: 24px 16px 0 !important; }
            .pad-header { padding: 22px 16px 18px !important; }
            .pad-footer { padding: 20px 16px !important; }
            .brand { font-size: 18px !important; letter-spacing: 4px !important; }
            .summary-cell { padding: 12px 14px !important; }
            .button { display: block !important; }
        }
    </style>
</head>
<body style="margin:0; padding:0; background-color:#f6f4ef; font-family:Helvetica, Arial, sans-serif;">
    {{-- preheader, invisible but picked up by mail clients --}}
    <div style="display:none; max-height:0; overflow:hidden;">
        Votre commande vous attend : envoyez-la sur WhatsApp pour la confirmer.
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
                                {{ $order->customer_name }}, votre commande vous attend
                            </h1>
                            <p style="margin:0 0 28px; font-size:14px; line-height:22px; color:#6d635a;">
                                Nous avons réservé vos articles, mais nous n’avons pas encore reçu votre commande sur WhatsApp.
                                Envoyez-nous le message de commande pour la confirmer. Vous payez à la livraison.
                            </p>

                            {{-- order summary box --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf9f5; border:1px solid #e8e1d6; border-radius:12px; margin-bottom:28px;">
                                <tr>
                                    <td class="summary-cell" style="padding:16px 20px;">
                                        <span style="font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#a2957f;">Total</span><br>
                                        <span style="font-family:Georgia, 'Times New Roman', serif; font-size:18px; color:#c8a24a;">{{ $money($order->total) }}</span>
                                    </td>
                                </tr>
                            </table>

                            {{-- items, short list — the full details are in the confirmation email --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse; margin-bottom:32px;">
                                @foreach ($order->items as $item)
                                    <tr>
                                        <td style="border-bottom:1px solid #eeeadf; padding:12px 8px 12px 0; font-size:14px; color:#221a12; word-wrap:break-word;">{{ $item->product_name }}</td>
                                        <td align="right" style="border-bottom:1px solid #eeeadf; padding:12px 0 12px 8px; font-size:14px; color:#6d635a; white-space:nowrap;">x{{ $item->quantity }}</td>
                                    </tr>
                                @endforeach
                            </table>

                            {{-- call to action --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ $order->whatsappRedirectUrl() }}" class="button" target="_blank"
                                           style="display:inline-block; background-color:#221a12; color:#ffffff; font-size:15px; font-weight:bold; text-decoration:none; padding:16px 36px; border-radius:999px;">
                                            Finaliser ma commande sur WhatsApp
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            {{-- warning --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fbf4e6; border:1px solid #ecdcb4; border-radius:12px; margin-bottom:32px;">
                                <tr>
                                    <td style="padding:14px 20px; font-size:13px; line-height:20px; color:#6d5a2e;">
                                        Les commandes non confirmées dans un délai d’<strong>une heure</strong> sont
                                        annulées automatiquement et les articles sont libérés.
                                    </td>
                                </tr>
                            </table>

                            <p style="margin:0 0 32px; font-size:13px; line-height:20px; color:#6d635a;">
                                Vous nous avez déjà envoyé le message ? Vous pouvez ignorer cet e-mail : nous confirmerons votre
                                commande très bientôt.
                            </p>
                        </td>
                    </tr>

                    {{-- footer --}}
                    <tr>
                        <td align="center" class="pad-footer" style="background-color:#221a12; padding:28px 40px; border-radius:0 0 16px 16px;">
                            <p class="brand" style="margin:0 0 6px; font-family:Georgia, 'Times New Roman', serif; font-size:13px; letter-spacing:4px; color:#c8a24a;">LUME PERFUMS</p>
                            <p style="margin:0; font-size:12px; line-height:18px; color:#8a7f72;">
                                Vous recevez cet e-mail car vous avez passé une commande sur notre boutique en ligne.<br>
                                Ceci est un rappel automatique : aucune réponse n’est nécessaire.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
